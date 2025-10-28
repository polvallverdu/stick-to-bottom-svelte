<script lang="ts">
	import { StickToBottom } from '$lib/StickToBottom.svelte.js';

	let messages = $state<
		Array<{ id: number; text: string; timestamp: Date; type: 'user' | 'system' }>
	>([
		{ id: 1, text: 'Welcome to the StickToBottom demo!', timestamp: new Date(), type: 'system' },
		{
			id: 2,
			text: 'This container automatically scrolls to the bottom when new content is added.',
			timestamp: new Date(),
			type: 'system'
		},
		{
			id: 3,
			text: 'Try scrolling up to read previous messages...',
			timestamp: new Date(),
			type: 'system'
		}
	]);

	let stream = $state(true);
	let animationType = $state<'instant' | 'spring'>('spring');
	let newMessage = $state('');

	let timeout: NodeJS.Timeout | undefined = undefined;
	let interval = $state(1500);
	let messageCounter = 4;

	const demoMessages = [
		'New message arrived!',
		'This is streaming content',
		'Auto-scroll keeps you at the bottom',
		'Unless you scroll up to read history',
		'Then it respects your reading position',
		'Scroll back down to re-enable auto-scroll',
		"The hook detects when you're near the bottom",
		'Perfect for chat interfaces and logs',
		'Configurable spring animations available',
		'Built with Svelte 5 runes for reactivity'
	];

	$effect(() => {
		timeout = setInterval(() => {
			if (stream) {
				const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)];
				messages = [
					...messages,
					{
						id: messageCounter++,
						text: randomMessage,
						timestamp: new Date(),
						type: 'system'
					}
				];
			}
		}, interval);

		return () => {
			clearInterval(timeout);
		};
	});

	let contentElement = $state<HTMLElement>();
	let scrollElement = $state<HTMLElement>();

	const stickToBottom = new StickToBottom({
		scrollElement: () => scrollElement,
		contentElement: () => contentElement,
		damping: 0.7,
		stiffness: 0.05,
		mass: 1.25
	});

	function sendMessage() {
		if (newMessage.trim()) {
			messages = [
				...messages,
				{
					id: messageCounter++,
					text: newMessage,
					timestamp: new Date(),
					type: 'user'
				}
			];
			newMessage = '';
		}
	}

	function clearMessages() {
		messages = [];
		messageCounter = 1;
	}

	function scrollToBottom() {
		const animation =
			animationType === 'instant' ? 'instant' : { damping: 0.7, stiffness: 0.05, mass: 1.25 };
		stickToBottom.scrollToBottom({ animation });
	}
</script>

<div class="mx-auto max-w-2xl space-y-6 p-6">
	<div class="text-center">
		<h2 class="mb-2 text-2xl font-bold text-gray-800">StickToBottom Demo</h2>
		<p class="text-gray-600">A Svelte hook for smart auto-scrolling containers</p>
	</div>

	<!-- Status Panel -->
	<div class="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3">
		<div class="text-center">
			<div class="text-sm font-medium text-gray-500">Near Bottom</div>
			<div
				class="text-lg font-semibold {stickToBottom.isNearBottom
					? 'text-green-600'
					: 'text-red-600'}"
			>
				{stickToBottom.isNearBottom ? 'Active' : 'Disabled'}
			</div>
		</div>
		<div class="text-center">
			<div class="text-sm font-medium text-gray-500">Is At Bottom</div>
			<div
				class="text-lg font-semibold {stickToBottom.isAtBottom ? 'text-green-600' : 'text-red-600'}"
			>
				{stickToBottom.isAtBottom ? 'At Bottom' : 'Not At Bottom'}
			</div>
		</div>
		<div class="text-center">
			<div class="text-sm font-medium text-gray-500">Escaped From Lock</div>
			<div
				class="text-lg font-semibold {stickToBottom.escapedFromLock
					? 'text-green-600'
					: 'text-red-600'}"
			>
				{stickToBottom.escapedFromLock ? 'Escaped From Lock' : 'Not Escaped From Lock'}
			</div>
		</div>
		<div class="text-center">
			<div class="text-sm font-medium text-gray-500">Scroll Position</div>
			<div class="text-lg font-semibold text-blue-600">
				{stickToBottom.scrollTop}px
			</div>
		</div>
		<div class="text-center">
			<div class="text-sm font-medium text-gray-500">Target Position</div>
			<div class="text-lg font-semibold text-purple-600">
				{stickToBottom.targetScrollTop}px
			</div>
		</div>
	</div>

	<!-- Chat-like Interface -->
	<div class="rounded-lg border border-gray-200 bg-white shadow-sm">
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-gray-200 p-4">
			<h3 class="font-semibold text-gray-800">Live Demo Chat</h3>
			<div class="flex items-center space-x-2">
				<div class="h-2 w-2 rounded-full {stream ? 'bg-green-500' : 'bg-gray-400'}"></div>
				<span class="text-sm text-gray-500">{stream ? 'Streaming' : 'Paused'}</span>
			</div>
		</div>

		<!-- Messages Area -->
		<div bind:this={scrollElement} class="h-80 overflow-y-auto p-4">
			<div bind:this={contentElement} class="space-y-3">
				{#each messages as message (message.id)}
					<div class="flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
						<div
							class="max-w-xs rounded-lg px-3 py-2 {message.type === 'user'
								? 'bg-blue-500 text-white'
								: 'bg-gray-100 text-gray-800'}"
						>
							<div class="text-sm">{message.text}</div>
							<div class="mt-1 text-xs opacity-70">
								{message.timestamp.toLocaleTimeString()}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Input Area -->
		<div class="border-t border-gray-200 p-4">
			<div class="flex space-x-2">
				<input
					bind:value={newMessage}
					onkeydown={(e) => e.key === 'Enter' && sendMessage()}
					placeholder="Type a message..."
					class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
				<button
					onclick={sendMessage}
					disabled={!newMessage.trim()}
					class="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Send
				</button>
			</div>
		</div>
	</div>

	<!-- Controls -->
	<div class="space-y-4">
		<div class="flex flex-wrap gap-3">
			<button
				onclick={() => (stream = !stream)}
				class="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
			>
				{stream ? 'Stop' : 'Start'} Auto Messages
			</button>

			<button
				onclick={scrollToBottom}
				class="rounded-md bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600"
			>
				Force Scroll to Bottom ({animationType})
			</button>

			<button
				onclick={() => stickToBottom.stopScroll()}
				class="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
			>
				Stop Auto-Scroll
			</button>

			<button
				onclick={clearMessages}
				class="rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
			>
				Clear Messages
			</button>

			<div class="flex items-center space-x-2">
				<button
					onclick={() => {
						const newInterval = interval - 100;
						interval = Math.max(newInterval, 100);
					}}
				>
					-
				</button>
				<span class="text-sm font-medium text-gray-700">{interval}ms</span>
				<button
					onclick={() => {
						const newInterval = interval + 100;
						interval = Math.min(newInterval, 5000);
					}}
				>
					+
				</button>
			</div>
		</div>

		<div class="flex items-center space-x-4">
			<label class="flex items-center space-x-2">
				<span class="text-sm font-medium text-gray-700">Animation:</span>
				<select bind:value={animationType} class="rounded border border-gray-300 px-2 py-1 text-sm">
					<option value="instant">Instant</option>
					<option value="spring">Spring</option>
				</select>
			</label>
		</div>
	</div>

	<!-- Instructions -->
	<div class="rounded-lg bg-blue-50 p-4">
		<h4 class="mb-2 font-medium text-blue-800">How to test:</h4>
		<ul class="space-y-1 text-sm text-blue-700">
			<li>• Messages automatically appear and scroll to bottom</li>
			<li>• Scroll up to read previous messages - auto-scroll will pause</li>
			<li>• Scroll back near the bottom to re-enable auto-scroll</li>
			<li>• Send your own messages to see the interaction</li>
			<li>• Try different animation types and controls</li>
		</ul>
	</div>
</div>
