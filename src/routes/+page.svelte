<script lang="ts">
	import Demo from '$lib/components/Demo.svelte';
</script>

<svelte:head>
	<title>StickToBottom Svelte - an Svelte Auto-Scroll Hook</title>
	<meta
		name="description"
		content="A powerful Svelte 5 hook for automatically scrolling to the bottom of containers with smart user interaction handling and configurable animations."
	/>
</svelte:head>

<main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<!-- Hero Section -->
	<section class="px-6 py-16 text-center">
		<div class="mx-auto max-w-4xl">
			<h1 class="mb-6 text-5xl font-bold text-gray-900">StickToBottom Svelte</h1>
			<p class="mb-8 text-xl leading-relaxed text-gray-600">
				A powerful Svelte 5 hook for automatically scrolling to the bottom of containers when new
				content is added, with intelligent user interaction handling and configurable spring
				animations.
			</p>

			<div class="mb-12 flex flex-wrap justify-center gap-4">
				<div class="flex items-center space-x-2 rounded-full bg-white px-4 py-2 shadow-sm">
					<div class="h-2 w-2 rounded-full bg-green-500"></div>
					<span class="text-sm font-medium text-gray-700">Smart Auto-Scroll</span>
				</div>
				<div class="flex items-center space-x-2 rounded-full bg-white px-4 py-2 shadow-sm">
					<div class="h-2 w-2 rounded-full bg-blue-500"></div>
					<span class="text-sm font-medium text-gray-700">Spring Animations</span>
				</div>
				<div class="flex items-center space-x-2 rounded-full bg-white px-4 py-2 shadow-sm">
					<div class="h-2 w-2 rounded-full bg-purple-500"></div>
					<span class="text-sm font-medium text-gray-700">TypeScript Ready</span>
				</div>
				<div class="flex items-center space-x-2 rounded-full bg-white px-4 py-2 shadow-sm">
					<div class="h-2 w-2 rounded-full bg-orange-500"></div>
					<span class="text-sm font-medium text-gray-700">Zero Dependencies</span>
				</div>
			</div>

			<div class="flex flex-wrap justify-center gap-4">
				<a
					href="https://github.com/polvallverdu/stick-to-bottom-svelte"
					class="inline-flex items-center rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
				>
					<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
							clip-rule="evenodd"
						/>
					</svg>
					View on GitHub
				</a>

				<a
					href="#demo"
					class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
				>
					Try Live Demo
				</a>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="bg-white px-6 py-16">
		<div class="mx-auto max-w-6xl">
			<h2 class="mb-12 text-center text-3xl font-bold text-gray-900">Perfect for Modern UIs</h2>

			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100"
					>
						<svg
							class="h-6 w-6 text-blue-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-lg font-semibold text-gray-900">Chat Interfaces</h3>
					<p class="text-sm text-gray-600">
						Perfect for real-time messaging apps. Automatically scrolls to new messages while
						letting users read chat history.
					</p>
				</div>

				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100"
					>
						<svg
							class="h-6 w-6 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-lg font-semibold text-gray-900">Live Logs</h3>
					<p class="text-sm text-gray-600">
						Keep console outputs and streaming logs always visible. Great for monitoring dashboards
						and debugging tools.
					</p>
				</div>

				<div class="text-center">
					<div
						class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100"
					>
						<svg
							class="h-6 w-6 text-purple-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
					<h3 class="mb-2 text-lg font-semibold text-gray-900">Live Feeds</h3>
					<p class="text-sm text-gray-600">
						Social media feeds, news streams, and any continuously updating content that users want
						to follow in real-time.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Code Example Section -->
	<section class="bg-gray-50 px-6 py-16">
		<div class="mx-auto max-w-4xl">
			<h2 class="mb-8 text-center text-3xl font-bold text-gray-900">Simple to Use</h2>

			<div class="overflow-x-auto rounded-lg bg-gray-900 p-6 text-sm text-gray-100">
				<pre><code
						>{`<script lang="ts">
  import { StickToBottom } from 'use-stick-to-bottom-svelte';
  
  let messages = $state([]);
  let scrollElement = $state<HTMLElement>();
  let contentElement = $state<HTMLElement>();
  
  const stickToBottom = new StickToBottom({
    scrollElement: () => scrollElement,
    contentElement: () => contentElement,
    damping: 0.7,      // Smooth spring animation
    stiffness: 0.05,   // Animation speed
    mass: 1.25         // Animation weight
  });
  
  function addMessage(text: string) {
    messages = [...messages, { text, id: Date.now() }];
    // Automatically scrolls to bottom if user is already there!
  }
</script>

<div bind:this={scrollElement} class="h-96 overflow-y-auto">
  <div bind:this={contentElement}>
    {#each messages as message (message.id)}
      <div class="message">{message.text}</div>
    {/each}
  </div>
</div>`}</code
					></pre>
			</div>

			<div class="mt-6 text-center">
				<a
					href="https://www.npmjs.com/package/use-stick-to-bottom-svelte"
					class="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
				>
					<svg class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
						<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					npm install use-stick-to-bottom-svelte
				</a>
			</div>
		</div>
	</section>

	<!-- Demo Section -->
	<section id="demo" class="bg-white px-6 py-16">
		<div class="mx-auto max-w-6xl">
			<h2 class="mb-8 text-center text-3xl font-bold text-gray-900">Interactive Demo</h2>
			<p class="mx-auto mb-12 max-w-2xl text-center text-gray-600">
				Try the hook in action! Scroll up to read previous messages, then scroll back down to see
				auto-scroll resume. The hook intelligently detects user behavior and responds accordingly.
			</p>

			<Demo />
		</div>
	</section>

	<!-- Installation & Documentation -->
	<section class="bg-gray-900 px-6 py-16 text-white">
		<div class="mx-auto max-w-4xl text-center">
			<h2 class="mb-6 text-3xl font-bold">Ready to Get Started?</h2>
			<p class="mb-8 text-lg text-gray-300">
				Add intelligent auto-scrolling to your Svelte applications in minutes.
			</p>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div class="rounded-lg bg-gray-800 p-6">
					<h3 class="mb-4 text-lg font-semibold">Quick Install</h3>
					<code class="block rounded bg-gray-700 p-3 text-sm text-green-400">
						npm install use-stick-to-bottom-svelte
					</code>
				</div>

				<div class="rounded-lg bg-gray-800 p-6">
					<h3 class="mb-4 text-lg font-semibold">Documentation</h3>
					<a
						href="https://github.com/polvallverdu/stick-to-bottom-svelte"
						class="inline-flex items-center text-blue-400 hover:text-blue-300"
					>
						<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
							/>
						</svg>
						Read the Full API Docs
					</a>
				</div>
			</div>
		</div>
	</section>
</main>
