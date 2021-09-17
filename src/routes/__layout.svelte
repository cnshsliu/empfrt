<script>
	import { navigating } from '$app/stores';
	import Nav from '$lib/Nav.svelte';
	import PreloadingIndicator from '$lib/PreloadingIndicator.svelte';
	import('jquery-ui-dist/jquery-ui.min.css');
	import('$lib/../app.css');
</script>

{#if $navigating}
	<PreloadingIndicator />
{/if}
<Nav />

<main>
	<slot />
</main>
