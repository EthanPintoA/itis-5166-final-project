<script lang="ts">
	import '../app.postcss';
	import { initializeStores, Toast } from '@skeletonlabs/skeleton';
	import { AppShell } from '@skeletonlabs/skeleton';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	initializeStores();

	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';

	import { util } from '$lib';

	const isLoggedIn = writable(util.hasToken());
	setContext('isLoggedIn', isLoggedIn);

	import { Navbar } from '$lib';

	onMount(() => {
		let tokenExpiration = util.getTokenExpiration();

		if (tokenExpiration) {
			let now = new Date().getTime();
			let expiration = new Date(tokenExpiration).getTime();

			if (now >= expiration) {
				console.log('Token expired');
				util.removeToken();
				isLoggedIn.set(false);
			} else {
				console.log('Token expires in', expiration - now, 'ms');
				setTimeout(() => {
					console.log('Token expired');
					util.removeToken();
					isLoggedIn.set(false);
					goto('/login').catch(console.error);
				}, expiration - now);
			}
		}
	});
</script>

<Toast />

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<Navbar />
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
