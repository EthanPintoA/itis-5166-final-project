<script lang="ts">
	import '../app.postcss';
	import { AppShell } from '@skeletonlabs/skeleton';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	import { Navbar } from '$lib';
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<Navbar />
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>