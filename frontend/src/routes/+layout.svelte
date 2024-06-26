<script lang="ts">
	import '../app.postcss';
	import { initializeStores, Toast } from '@skeletonlabs/skeleton';
	import { AppShell } from '@skeletonlabs/skeleton';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	initializeStores();

	import { onDestroy, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';

	import { util } from '$lib';

	const isLoggedIn = writable(util.hasToken());
	setContext('isLoggedIn', isLoggedIn);

	import moment from 'moment-timezone';

	import { Navbar, api } from '$lib';

	let tokenTimeout: NodeJS.Timeout;
	/** Shows warning 20 seconds before `tokenTimeout` */
	let showWarningTimeout: NodeJS.Timeout;

	$: {
		if (tokenTimeout) {
			clearTimeout(tokenTimeout);
		}
		if (showWarningTimeout) {
			clearTimeout(showWarningTimeout);
		}

		// User logged in, renewed the token, enters the site
		if ($isLoggedIn) {
			let expiration = util.getTokenExpiration();

			if (expiration) {
				// Get the current time in EST
				let now = moment().tz('America/New_York').valueOf();

				// Applies for the user enters the site and the token is expired
				if (now >= expiration) {
					console.log('Time since token expired', now - expiration, 'ms');
					util.removeToken();
					goto('/logout').catch(console.error);
				} else {
					console.log('Token expires in', expiration - now, 'ms');
					tokenTimeout = setTimeout(() => {
						console.log('Token expired after', expiration - now, 'ms');
						util.removeToken();
						visible.set(false);
						goto('/logout').catch(console.error);
					}, expiration - now);
					showWarningTimeout = setTimeout(
						() => {
							console.log('Show warning');
							visible.set(true);
						},
						expiration - now - 20000
					);
				}
			}
		} else {
			console.log('User is not logged in, token expired, or logged out');
		}
	}

	onDestroy(() => {
		if (tokenTimeout) {
			clearTimeout(tokenTimeout);
			console.log('Token timeout cleared');
		}
		if (showWarningTimeout) {
			clearTimeout(showWarningTimeout);
		}
	});

	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { HTTPError } from 'ky';

	const visible = writable(false);
	setContext('visible', visible);

	async function renewToken() {
		const oldToken = util.getToken();

		if (!oldToken) {
			console.error('No token found');
			return;
		}

		try {
			const newToken = await api.renewToken(oldToken);

			util.setToken(newToken);

			// I have to set to false and then to true to trigger the reactivity.
			isLoggedIn.set(false);
			isLoggedIn.set(true);
			visible.set(false);
			console.log('Token renewed');
		} catch (error) {
			if (error instanceof HTTPError) {
				if (error.response.status === 401) {
					const errorBody = (await error.response.json()) as { message: string };
					console.error(errorBody.message);
					util.removeToken();
					isLoggedIn.set(false);
					goto('/login').catch(console.error);
				}
			} else {
				console.error(error);
			}
		}
	}
</script>

<Toast />

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- A11y support -->
		<a href="#main" class="skip">Skip to content</a>

		<Navbar />
		{#if $visible}
			<aside class="alert mx-32 variant-soft-warning">
				<i class="fa-solid fa-triangle-exclamation text-4xl" />
				<!-- Message -->
				<div class="alert-message">
					<h3 class="h3">Warning</h3>
					<p>
						Your login will expire in 20 seconds. You can click the renew button if you do not want
						to log out
					</p>
				</div>
				<!-- Actions -->
				<div class="alert-actions">
					<button class="btn btn-primary" on:click={renewToken}>Renew</button>
					<button class="btn btn-secondary" on:click={() => ($visible = false)}>
						<i class="fa-solid fa-xmark text-3xl" />
					</button>
				</div>
			</aside>
		{/if}
	</svelte:fragment>

	<!-- Page Route Content -->
	<div id="main"><slot /></div>
</AppShell>

<style>
	.skip {
		position: absolute;
		top: -1000px;
		left: -1000px;
		height: 1px;
		width: 1px;
		text-align: left;
		overflow: hidden;
	}

	.skip:focus {
		position: static;
		height: auto;
		width: auto;
		overflow: visible;
	}
</style>
