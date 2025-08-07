# stick-to-bottom-svelte

A powerful Svelte 5 hook for automatically scrolling to the bottom of containers when new content is added, with intelligent user interaction handling and configurable spring animations.

Perfect for chat interfaces, live logs, streaming content, and any scenario where you want to keep users at the bottom of scrollable content while respecting their reading preferences.

## Features

- 🚀 **Automatic scroll-to-bottom** when new content is added
- 🎯 **Smart user interaction detection** - pauses auto-scroll when users scroll up to read
- 🌊 **Configurable spring animations** with damping, stiffness, and mass controls
- ⚡ **Instant scroll option** for immediate positioning
- 🎮 **Manual control** with programmatic scroll methods
- 📱 **Touch and mouse selection aware** - respects user text selection
- 🔧 **TypeScript support** with full type definitions
- 🎪 **Zero dependencies** (except Svelte 5)

_(aside from all the other features from the original package...)_

## Installation

```bash
pnpm install stick-to-bottom-svelte
```

## Basic Usage

```svelte
<script lang="ts">
	import { StickToBottom } from 'stick-to-bottom-svelte';

	let messages = $state([]);
	let scrollElement = $state<HTMLElement>();
	let contentElement = $state<HTMLElement>();

	const stickToBottom = new StickToBottom({
		scrollElement: () => scrollElement,
		contentElement: () => contentElement
	});

	// Add new messages - they'll automatically scroll to bottom
	function addMessage(text: string) {
		messages = [...messages, { text, id: Date.now() }];
	}
</script>

<div bind:this={scrollElement} class="h-96 overflow-y-auto">
	<div bind:this={contentElement}>
		{#each messages as message (message.id)}
			<div>{message.text}</div>
		{/each}
	</div>
</div>
```

## Advanced Configuration

### Spring Animation Settings

Customize the scroll animation with spring physics:

```svelte
<script>
	const stickToBottom = new StickToBottom({
		scrollElement: () => scrollElement,
		contentElement: () => contentElement,

		// Spring animation configuration
		damping: 0.8, // 0-1, higher = less oscillation
		stiffness: 0.1, // 0-1, higher = faster animation
		mass: 1.0, // 0.5-3, higher = slower animation

		// Animation for resize events
		resize: 'instant', // or spring config object

		// Initial scroll behavior
		initial: true // false to disable initial scroll
	});
</script>
```

### Custom Target Scroll Position

Control exactly where the "bottom" should be:

```svelte
<script>
	const stickToBottom = new StickToBottom({
		scrollElement: () => scrollElement,
		contentElement: () => contentElement,

		// Custom target calculation
		targetScrollTop: (defaultTarget, { scrollElement, contentElement }) => {
			// Scroll to 50px before the actual bottom
			return defaultTarget - 50;
		}
	});
</script>
```

## API Reference

### StickToBottom Class

#### Constructor Options

```typescript
interface StickToBottomOptions {
	// Required: Element references
	scrollElement: () => HTMLElement | null | undefined;
	contentElement: () => HTMLElement | null | undefined;

	// Spring animation configuration
	damping?: number; // Default: 0.7
	stiffness?: number; // Default: 0.05
	mass?: number; // Default: 1.25

	// Behavior configuration
	resize?: Animation; // Animation for resize events
	initial?: Animation | boolean; // Initial scroll behavior
	targetScrollTop?: GetTargetScrollTop; // Custom target calculation
}
```

#### Properties (Reactive)

```typescript
// State properties (reactive with Svelte 5 runes)
stickToBottom.isNearBottom; // boolean - true when near bottom
stickToBottom.scrollTop; // number - current scroll position
stickToBottom.targetScrollTop; // number - target scroll position
```

#### Methods

```typescript
// Scroll to bottom with options
stickToBottom.scrollToBottom(options?: ScrollToBottomOptions): Promise<boolean>

// Stop auto-scrolling (user has "escaped")
stickToBottom.stopScroll(): void

// Check if user is currently selecting text
stickToBottom.isSelecting(): boolean
```

### ScrollToBottomOptions

```typescript
type ScrollToBottomOptions =
	| 'instant' // Immediate scroll
	| {
			animation?: 'instant' | SpringAnimation;
			wait?: boolean | number; // Wait for existing scroll
			ignoreEscapes?: boolean; // Prevent user interruption
			preserveScrollPosition?: boolean; // Only scroll if already at bottom
			duration?: number | Promise<void>; // Additional duration to maintain
	  };
```

### Animation Types

```typescript
// Spring animation configuration
interface SpringAnimation {
	damping?: number; // 0-1, controls oscillation
	stiffness?: number; // 0-1, controls speed
	mass?: number; // 0.5-3, controls momentum
}

// Animation can be instant or spring-based
type Animation = 'instant' | SpringAnimation;
```

## Common Patterns

### Chat Interface

```svelte
<script lang="ts">
	import { StickToBottom } from 'stick-to-bottom-svelte';

	let messages = $state([]);
	let newMessage = $state('');
	let scrollElement = $state<HTMLElement>();
	let contentElement = $state<HTMLElement>();

	const stickToBottom = new StickToBottom({
		scrollElement: () => scrollElement,
		contentElement: () => contentElement,
		// Smooth spring animation for chat
		damping: 0.7,
		stiffness: 0.08,
		mass: 1.2
	});

	function sendMessage() {
		if (newMessage.trim()) {
			messages = [
				...messages,
				{
					text: newMessage,
					timestamp: new Date(),
					id: Date.now()
				}
			];
			newMessage = '';
		}
	}

	// Handle incoming messages from WebSocket, etc.
	function onIncomingMessage(message) {
		messages = [...messages, message];
		// Will automatically scroll to bottom if user is already there
	}
</script>

<div class="chat-container">
	<div bind:this={scrollElement} class="messages-area">
		<div bind:this={contentElement}>
			{#each messages as message (message.id)}
				<div class="message">
					{message.text}
					<span class="timestamp">{message.timestamp.toLocaleTimeString()}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="input-area">
		<input
			bind:value={newMessage}
			onkeydown={(e) => e.key === 'Enter' && sendMessage()}
			placeholder="Type a message..."
		/>
		<button onclick={sendMessage}>Send</button>
	</div>
</div>
```

### Live Logs

```svelte
<script lang="ts">
	import { StickToBottom } from 'stick-to-bottom-svelte';

	let logs = $state([]);
	let scrollElement = $state<HTMLElement>();
	let contentElement = $state<HTMLElement>();

	const stickToBottom = new StickToBottom({
		scrollElement: () => scrollElement,
		contentElement: () => contentElement,
		// Instant scroll for logs - no animation needed
		resize: 'instant',
		initial: 'instant'
	});

	// Simulate log streaming
	let logInterval;
	onMount(() => {
		logInterval = setInterval(() => {
			logs = [
				...logs,
				{
					level: 'info',
					message: `Log entry at ${new Date().toISOString()}`,
					id: Date.now()
				}
			];
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(logInterval);
	});
</script>

<div bind:this={scrollElement} class="log-viewer">
	<div bind:this={contentElement}>
		{#each logs as log (log.id)}
			<div class="log-entry {log.level}">
				[{log.level.toUpperCase()}] {log.message}
			</div>
		{/each}
	</div>
</div>
```

### Manual Control

```svelte
<script lang="ts">
	// ... setup ...

	// Force scroll to bottom
	function forceScrollToBottom() {
		stickToBottom.scrollToBottom({ animation: 'instant' });
	}

	// Scroll with custom animation
	function smoothScrollToBottom() {
		stickToBottom.scrollToBottom({
			animation: { damping: 0.9, stiffness: 0.1, mass: 0.8 },
			duration: 500 // Keep at bottom for 500ms
		});
	}

	// Stop auto-scrolling
	function pauseAutoScroll() {
		stickToBottom.stopScroll();
	}

	// Check scroll state
	$effect(() => {
		if (stickToBottom.isNearBottom) {
			console.log('User is at the bottom - auto-scroll active');
		} else {
			console.log('User scrolled up - auto-scroll paused');
		}
	});
</script>
```

## Behavior Details

### Auto-Scroll Logic

The hook automatically scrolls to bottom when:

- New content is added AND user is already near the bottom
- Container is resized (making more content visible)
- `scrollToBottom()` is called manually

### User Interaction Handling

Auto-scroll is paused when:

- User scrolls up more than 70px from bottom
- User is selecting/highlighting text
- User manually stops scrolling via `stopScroll()`

Auto-scroll resumes when:

- User scrolls back to within 70px of bottom
- New `scrollToBottom()` call is made

### Animation System

- **Spring animations** use physics-based motion with configurable damping, stiffness, and mass
- **Instant scrolling** immediately jumps to target position
- **Smooth transitions** respect user interactions and don't interrupt reading
- **Performance optimized** with 60fps targeting and smart frame skipping

## Browser Support

- All modern browsers supporting Svelte 5
- Requires ResizeObserver (available in all modern browsers)
- Uses requestAnimationFrame for smooth animations
- Gracefully handles edge cases across different scrolling behaviors

## Inspiration

This package is inspired by the original [use-stick-to-bottom](https://github.com/stackblitz/use-stick-to-bottom) package, which is a great library for automatically scrolling to the bottom of containers when new content is added.

This package is a Svelte 5 port of the original package, with all the features of the original package, plus some additional features.

## TypeScript

This package is written in TypeScript and includes full type definitions. All interfaces and types are exported for use in your applications.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## License

MIT License - see LICENSE file for details.
