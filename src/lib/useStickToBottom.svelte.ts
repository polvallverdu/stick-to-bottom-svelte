import { browser } from '$app/environment';

export interface StickToBottomAnimationState {
	behavior: 'instant' | Required<SpringAnimation>;
	ignoreEscapes: boolean;
	promise: Promise<boolean>;
}

export interface StickToBottomState {
	scrollTop: number;
	lastScrollTop?: number;
	ignoreScrollToTop?: number;
	targetScrollTop: number;
	calculatedTargetScrollTop: number;
	scrollDifference: number;
	resizeDifference: number;

	animation?: StickToBottomAnimationState;
	lastTick?: number;
	velocity: number;
	accumulated: number;

	escapedFromLock: boolean;
	isAtBottom: boolean;
	isNearBottom: boolean;

	resizeObserver?: ResizeObserver;
}

const DEFAULT_SPRING_ANIMATION = {
	/**
	 * A value from 0 to 1, on how much to damp the animation.
	 * 0 means no damping, 1 means full damping.
	 *
	 * @default 0.7
	 */
	damping: 0.7,

	/**
	 * The stiffness of how fast/slow the animation gets up to speed.
	 *
	 * @default 0.05
	 */
	stiffness: 0.05,

	/**
	 * The inertial mass associated with the animation.
	 * Higher numbers make the animation slower.
	 *
	 * @default 1.25
	 */
	mass: 1.25
};

export type SpringAnimation = Partial<typeof DEFAULT_SPRING_ANIMATION>;

export type Animation = ScrollBehavior | SpringAnimation;

export interface ScrollElements {
	scrollElement: () => HTMLElement | null | undefined;
	contentElement: () => HTMLElement | null | undefined;
}

export type GetTargetScrollTop = (targetScrollTop: number, context: ScrollElements) => number;

export interface StickToBottomOptions extends SpringAnimation, ScrollElements {
	resize?: Animation;
	initial?: Animation | boolean;
	targetScrollTop?: GetTargetScrollTop;
}

export type ScrollToBottomOptions =
	| ScrollBehavior
	| {
			animation?: Animation;

			/**
			 * Whether to wait for any existing scrolls to finish before
			 * performing this one. Or if a millisecond is passed,
			 * it will wait for that duration before performing the scroll.
			 *
			 * @default false
			 */
			wait?: boolean | number;

			/**
			 * Whether to prevent the user from escaping the scroll,
			 * by scrolling up with their mouse.
			 */
			ignoreEscapes?: boolean;

			/**
			 * Only scroll to the bottom if we're already at the bottom.
			 *
			 * @default false
			 */
			preserveScrollPosition?: boolean;

			/**
			 * The extra duration in ms that this scroll event should persist for.
			 * (in addition to the time that it takes to get to the bottom)
			 *
			 * Not to be confused with the duration of the animation -
			 * for that you should adjust the animation option.
			 *
			 * @default 0
			 */
			duration?: number | Promise<void>;
	  };

export type ScrollToBottom = (scrollOptions?: ScrollToBottomOptions) => Promise<boolean> | boolean;
export type StopScroll = () => void;

const STICK_TO_BOTTOM_OFFSET_PX = 70;
const SIXTY_FPS_INTERVAL_MS = 1000 / 60;
const RETAIN_ANIMATION_DURATION_MS = 350;

let mouseDown = $state(false);

if (browser) {
	document.addEventListener('mousedown', () => {
		mouseDown = true;
	});

	document.addEventListener('mouseup', () => {
		mouseDown = false;
	});

	document.addEventListener('click', () => {
		mouseDown = false;
	});
}

function isEqual(a: any, b: any) {
	return JSON.stringify(a) === JSON.stringify(b);
}

export class StickToBottom {
	private escapedFromLock = $state(false);
	private isAtBottom = $state(false);
	private isNearBottomState = $state(false);
	private lastCalculation: { targetScrollTop: number; calculatedScrollTop: number } | undefined;

	// From state
	private ignoreScrollToTop: number | undefined = undefined;
	private animation: StickToBottomAnimationState | undefined = undefined;
	private lastTick: number | undefined = undefined;
	private velocity = 0;
	private accumulated = 0;
	private lastScrollTop = 0;
	private resizeDifference = 0;

	constructor(private options: StickToBottomOptions) {
		this.isAtBottom = options.initial !== false;

		$effect(() => {
			const scrollRef = this.options.scrollElement();
			if (!scrollRef) return;

			scrollRef.addEventListener('wheel', this.handleScroll, { passive: true });
			scrollRef.addEventListener('scroll', this.handleScroll, { passive: true });

			return () => {
				scrollRef.removeEventListener('wheel', this.handleScroll);
				scrollRef.removeEventListener('scroll', this.handleScroll);
			};
		});

		$effect(() => {
			const contentRef = this.options.contentElement();
			if (!contentRef) return;

			let previousHeight: number | undefined;

			const resizeObserver = new ResizeObserver(([entry]) => {
				const { height } = entry.contentRect;
				const difference = height - (previousHeight ?? height);

				this.resizeDifference = difference;

				/**
				 * Sometimes the browser can overscroll past the target,
				 * so check for this and adjust appropriately.
				 */
				if (this.scrollTop > this.targetScrollTop) {
					this.setScrollTop(this.targetScrollTop);
				}

				this.isNearBottomState = this.internal_isNearBottom;

				if (difference >= 0) {
					/**
					 * If it's a positive resize, scroll to the bottom when
					 * we're already at the bottom.
					 */
					const animation = mergeAnimations(
						this.options,
						previousHeight ? this.options.resize : this.options.initial
					);

					this.scrollToBottom({
						animation,
						wait: true,
						preserveScrollPosition: true,
						duration: animation === 'instant' ? undefined : RETAIN_ANIMATION_DURATION_MS
					});
				} else {
					/**
					 * Else if it's a negative resize, check if we're near the bottom
					 * if we are want to un-escape from the lock, because the resize
					 * could have caused the container to be at the bottom.
					 */
					if (this.internal_isNearBottom) {
						this.escapedFromLock = false;
						this.isAtBottom = true;
					}
				}

				previousHeight = height;

				/**
				 * Reset the resize difference after the scroll event
				 * has fired. Requires a rAF to wait for the scroll event,
				 * and a setTimeout to wait for the other timeout we have in
				 * resizeObserver in case the scroll event happens after the
				 * resize event.
				 */
				requestAnimationFrame(() => {
					setTimeout(() => {
						if (this.resizeDifference === difference) {
							this.resizeDifference = 0;
						}
					}, 1);
				});
			});

			resizeObserver.observe(contentRef);

			return () => {
				resizeObserver.disconnect();
			};
		});
	}

	isSelecting = () => {
		if (!mouseDown) return false;

		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) return false;

		const range = selection.getRangeAt(0);

		const scrollRef = this.options.scrollElement();

		return (
			range.commonAncestorContainer.contains(scrollRef) ||
			scrollRef?.contains(range.commonAncestorContainer)
		);
	};

	get scrollTop() {
		const scrollRef = this.options.scrollElement();
		return scrollRef?.scrollTop ?? 0;
	}

	setScrollTop(scrollTop: number) {
		const scrollRef = this.options.scrollElement();
		if (!scrollRef) return;
		scrollRef.scrollTop = scrollTop;
		this.ignoreScrollToTop = scrollRef.scrollTop;
	}

	get targetScrollTop() {
		const scrollRef = this.options.scrollElement();
		const contentRef = this.options.contentElement();

		if (!scrollRef || !contentRef) {
			return 0;
		}

		return scrollRef.scrollHeight - 1 - scrollRef.clientHeight;
	}

	get calculatedTargetScrollTop() {
		const scrollRef = this.options.scrollElement();
		const contentRef = this.options.contentElement();

		if (!scrollRef || !contentRef) {
			return 0;
		}

		const { targetScrollTop } = this;

		if (!this.options.targetScrollTop) {
			return targetScrollTop;
		}

		if (this.lastCalculation?.targetScrollTop === targetScrollTop) {
			return this.lastCalculation.calculatedScrollTop;
		}

		const calculatedScrollTop = Math.max(
			Math.min(
				this.options.targetScrollTop(targetScrollTop, {
					scrollElement: this.options.scrollElement,
					contentElement: this.options.contentElement
				}),
				targetScrollTop
			),
			0
		);

		this.lastCalculation = { targetScrollTop, calculatedScrollTop };

		requestAnimationFrame(() => {
			this.lastCalculation = undefined;
		});

		return calculatedScrollTop;
	}

	get scrollDifference() {
		return this.calculatedTargetScrollTop - this.scrollTop;
	}

	get internal_isNearBottom() {
		return this.scrollDifference <= STICK_TO_BOTTOM_OFFSET_PX;
	}

	get isNearBottom() {
		return this.isNearBottomState;
	}

	scrollToBottom = (scrollOptions: ScrollToBottomOptions): Promise<boolean> | boolean => {
		if (typeof scrollOptions === 'string') {
			scrollOptions = { animation: scrollOptions };
		}

		if (!scrollOptions.preserveScrollPosition) {
			this.isAtBottom = true;
		}

		const waitElapsed = Date.now() + (Number(scrollOptions.wait) || 0);
		const behavior = mergeAnimations(this.options, scrollOptions.animation);
		const { ignoreEscapes = false } = scrollOptions;

		let durationElapsed: number;
		let startTarget = this.calculatedTargetScrollTop;

		if (scrollOptions.duration instanceof Promise) {
			scrollOptions.duration.finally(() => {
				durationElapsed = Date.now();
			});
		} else {
			durationElapsed = waitElapsed + (scrollOptions.duration ?? 0);
		}

		const next = async (): Promise<boolean> => {
			const promise = new Promise(requestAnimationFrame).then(() => {
				if (!this.isAtBottom) {
					this.animation = undefined;

					return false;
				}

				const snapshottedScrollTop = $state.snapshot(this.scrollTop);
				const tick = performance.now();
				const tickDelta = (tick - (this.lastTick ?? tick)) / SIXTY_FPS_INTERVAL_MS;
				this.animation ||= { behavior, promise, ignoreEscapes };

				if (isEqual($state.snapshot(this.animation.behavior), behavior)) {
					this.lastTick = tick;
				}

				if (this.isSelecting()) {
					return next();
				}

				if (waitElapsed > Date.now()) {
					return next();
				}

				if (snapshottedScrollTop < Math.min(startTarget, this.calculatedTargetScrollTop)) {
					if (isEqual($state.snapshot(this.animation.behavior), behavior)) {
						if (behavior === 'instant') {
							this.setScrollTop(this.calculatedTargetScrollTop);
							return next();
						}

						this.velocity =
							(behavior.damping * this.velocity + behavior.stiffness * this.scrollDifference) /
							behavior.mass;
						this.accumulated += this.velocity * tickDelta;
						this.setScrollTop(this.scrollTop + this.accumulated);

						if ($state.snapshot(this.scrollTop) !== snapshottedScrollTop) {
							this.accumulated = 0;
						}
					}

					return next();
				}

				if (durationElapsed > Date.now()) {
					startTarget = this.calculatedTargetScrollTop;

					return next();
				}

				this.animation = undefined;

				/**
				 * If we're still below the target, then queue
				 * up another scroll to the bottom with the last
				 * requested animatino.
				 */
				if (this.scrollTop < this.calculatedTargetScrollTop) {
					return this.scrollToBottom({
						animation: mergeAnimations(this.options, this.options.resize),
						ignoreEscapes,
						duration: Math.max(0, durationElapsed - Date.now()) || undefined
					});
				}

				return this.isAtBottom;
			});

			return promise.then((isAtBottom) => {
				requestAnimationFrame(() => {
					if (!this.animation) {
						this.lastTick = undefined;
						this.velocity = 0;
					}
				});

				return isAtBottom;
			});
		};

		if (scrollOptions.wait !== true) {
			this.animation = undefined;
		}

		if (this.animation?.behavior === behavior) {
			return this.animation.promise;
		}

		return next();
	};

	stopScroll = () => {
		this.escapedFromLock = true;
		this.isAtBottom = false;
	};

	handleScroll = ({ target }: Event) => {
		const scrollRef = target as HTMLElement;
		if (target !== scrollRef) {
			return;
		}

		this.lastScrollTop = this.scrollTop;
		this.ignoreScrollToTop = undefined;

		if (this.ignoreScrollToTop && this.ignoreScrollToTop > this.scrollTop) {
			/**
			 * When the user scrolls up while the animation plays, the `scrollTop` may
			 * not come in separate events; if this happens, to make sure `isScrollingUp`
			 * is correct, set the lastScrollTop to the ignored event.
			 */
			this.lastScrollTop = this.ignoreScrollToTop;
		}

		this.isNearBottomState = this.internal_isNearBottom;

		/**
		 * Scroll events may come before a ResizeObserver event,
		 * so in order to ignore resize events correctly we use a
		 * timeout.
		 *
		 * @see https://github.com/WICG/resize-observer/issues/25#issuecomment-248757228
		 */
		setTimeout(() => {
			/**
			 * When theres a resize difference ignore the resize event.
			 */
			if (this.resizeDifference || this.scrollTop === this.ignoreScrollToTop) {
				return;
			}

			if (this.isSelecting()) {
				this.stopScroll();
				return;
			}

			const isScrollingDown = this.scrollTop > this.lastScrollTop;
			const isScrollingUp = this.scrollTop < this.lastScrollTop;

			if (this.animation?.ignoreEscapes) {
				this.setScrollTop(this.lastScrollTop);
				return;
			}

			if (isScrollingUp) {
				this.stopScroll();
			}

			if (isScrollingDown) {
				this.escapedFromLock = false;
			}

			if (!this.escapedFromLock && this.internal_isNearBottom) {
				this.isAtBottom = true;
			}
		}, 1);
	};
}

const animationCache = new Map<string, Readonly<Required<SpringAnimation>>>();

function mergeAnimations(...animations: (Animation | boolean | undefined)[]) {
	const result = { ...DEFAULT_SPRING_ANIMATION };
	let instant = false;

	for (const animation of animations) {
		if (animation === 'instant') {
			instant = true;
			continue;
		}

		if (typeof animation !== 'object') {
			continue;
		}

		instant = false;

		result.damping = animation.damping ?? result.damping;
		result.stiffness = animation.stiffness ?? result.stiffness;
		result.mass = animation.mass ?? result.mass;
	}

	const key = JSON.stringify(result);

	if (!animationCache.has(key)) {
		animationCache.set(key, Object.freeze(result));
	}

	return instant ? 'instant' : animationCache.get(key)!;
}
