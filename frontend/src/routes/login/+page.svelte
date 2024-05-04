<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { get, type Writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { HTTPError } from 'ky';
	import { object, string, ValidationError } from 'yup';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	import { util, api } from '$lib';

	const isLoggedIn = getContext('isLoggedIn') as Writable<boolean>;

	onMount(() => {
		if (get(isLoggedIn)) {
			goto('/dashboard').catch(console.error);
		}
	});

	async function handleLogin() {
		let schema = object({
			username: string().trim().required(),
			password: string().trim().required()
		});

		try {
			await schema.validate({ username, password });
		} catch (error) {
			if (error instanceof ValidationError) {
				let t: ToastSettings = {
					message: error.message,
					background: 'variant-filled-primary',
					autohide: true
				};
				t.background = 'variant-filled-error';
				toastStore.trigger(t);
				return;
			}
			console.error(error);
			return;
		}

		try {
			const token = await api.login(username, password);

			isLoggedIn.set(true);
			util.setToken(token);
			goto('/dashboard').catch(console.error);
		} catch (error) {
			if (error instanceof HTTPError) {
				const errorBody = (await error.response.json()) as { message: string };
				const t: ToastSettings = {
					message: errorBody.message,
					background: 'variant-filled-error',
					autohide: true
				};
				toastStore.trigger(t);
			}
			console.error(error);
		}
	}

	const toastStore = getToastStore();

	let username = '';
	let password = '';
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
			Log in to your account
		</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<!-- Form request handled by `handleLogin` -->
		<form class="space-y-6">
			<div>
				<label for="username" class="block text-sm font-medium leading-6 text-white">Username</label
				>
				<div class="mt-2">
					<input
						id="username"
						name="username"
						type="text"
						autocomplete="username"
						required
						class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
						bind:value={username}
					/>
				</div>
			</div>

			<div>
				<div class="flex items-center justify-between">
					<label for="password" class="block text-sm font-medium leading-6 text-white"
						>Password
					</label>
				</div>
				<div class="mt-2">
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
						bind:value={password}
					/>
				</div>
			</div>

			<div>
				<button
					type="button"
					class="flex w-full justify-center rounded-md bg-teal-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
					on:click={handleLogin}
				>
					Sign in
				</button>
			</div>
		</form>
	</div>
</div>
