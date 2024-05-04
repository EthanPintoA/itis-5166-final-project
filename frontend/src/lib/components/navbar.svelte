<script lang="ts">
	import { getContext } from 'svelte';
	import { type Writable } from 'svelte/store';

	const isLoggedIn = getContext('isLoggedIn') as Writable<boolean>;
</script>

<nav class="flex items-center justify-between flex-wrap variant-filled-surface p-6">
	<div class="flex items-center flex-shrink-0 text-white mr-10">
		<strong class="font-semibold text-xl tracking-tight">Personal Budget</strong>
	</div>
	<div class="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
		<div class="text-sm lg:flex-grow">
			<a href="/" class="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-teal-200 mr-6">
				Home
			</a>
			{#if $isLoggedIn}
				<a
					href="/dashboard"
					class="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-teal-200 mr-6"
				>
					Dashboard
				</a>
				<a
					href="/budget"
					class="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-teal-200 mr-6"
				>
					Budget
				</a>
				<a
					href="/expenses"
					class="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-teal-200"
				>
					Expenses
				</a>
			{/if}
		</div>
		<div>
			{#if $isLoggedIn}
				<a
					href="/logout"
					class="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0 mr-5"
					>Logout</a
				>
			{:else}
				<a
					href="/login"
					class="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0 mr-5"
					>Login</a
				>
				<a
					href="/signup"
					class="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
					>Signup</a
				>
			{/if}
		</div>
	</div>
</nav>
