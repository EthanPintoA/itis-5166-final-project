<script>
	import { AppBar } from '@skeletonlabs/skeleton';

	import { util } from '$lib';
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<strong class="text-xl">Personal Budget</strong>
		<a class="btn btn-sm variant-ghost-surface" href="/"> Home </a>
		<a class="btn btn-sm variant-ghost-surface" href="/dashboard"> Dashboard </a>
		<a class="btn btn-sm variant-ghost-surface" href="/budget"> Budgets </a>
		<a class="btn btn-sm variant-ghost-surface" href="/expenses"> Expenses </a>
	</svelte:fragment>
	<svelte:fragment slot="trail">
		{#if util.isLoggedIn()}
			<a class="btn btn-sm variant-ghost-surface" href="/logout"> Logout </a>
		{:else}
			<a class="btn btn-sm variant-ghost-surface" href="/login"> Login </a>
			<a class="btn btn-sm variant-ghost-surface" href="/signup"> Signup </a>
		{/if}
	</svelte:fragment>
</AppBar>
