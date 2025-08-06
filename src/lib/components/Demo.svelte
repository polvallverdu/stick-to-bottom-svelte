<script lang="ts">
	import { StickToBottom } from '$lib/useStickToBottom.svelte.js';
	import { onDestroy, onMount } from 'svelte';

	let content = $state('');
	let stream = $state(true);

	let timeout: NodeJS.Timeout | undefined = undefined;

	onMount(() => {
		timeout = setInterval(() => {
			if (stream) {
				content += 'Hello, world!';
			}
		}, 50);
	});

	onDestroy(() => {
		clearInterval(timeout);
	});

	let contentElement = $state<HTMLElement>();
	let scrollElement = $state<HTMLElement>();

	const stickToBottom = new StickToBottom({
		scrollElement: () => scrollElement,
		contentElement: () => contentElement
	});

	$effect(() => {
		if (!stickToBottom.isNearBottom) {
			stickToBottom.stopScroll();
		}
	});
</script>

<p>{stickToBottom.isNearBottom}</p>
<p>{stickToBottom.scrollTop}</p>
<p>{stickToBottom.targetScrollTop}</p>

<div
	bind:this={scrollElement}
	class="h-full max-h-[200px] w-full max-w-[300px] overflow-y-auto bg-red-500 p-2"
>
	<div bind:this={contentElement} class="h-full bg-blue-500">
		{content}
	</div>
</div>

<button onclick={() => (stream = !stream)}>Toggle stream {stream ? 'on' : 'off'}</button>
<button onclick={() => stickToBottom.scrollToBottom({ animation: 'instant' })}
	>Scroll to bottom</button
>

<button onclick={() => stickToBottom.stopScroll()}>Stop</button>
