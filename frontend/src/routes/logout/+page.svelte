<script lang="ts">
	import { getContext } from 'svelte';
	import { get, type Writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { util } from '$lib';

	const isLoggedIn = getContext('isLoggedIn') as Writable<boolean>;
	const visible = getContext('visible') as Writable<boolean>;

	if (get(isLoggedIn)) {
		util.removeToken();
		visible.set(false);
		isLoggedIn.set(false);
	} else {
		goto('/').catch(console.error);
	}
</script>

<h1 class="text-center">Logout</h1>
