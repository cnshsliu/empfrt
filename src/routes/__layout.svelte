<script lang="ts">
	import { navigating, session } from '$app/stores';
	import NavMenu from '$lib/NavMenu.svelte';
	import ErrHint from '$lib/ErrHint.svelte';
	import PreloadingIndicator from '$lib/PreloadingIndicator.svelte';
	import('jquery-ui-dist/jquery-ui.min.css');
	import('$lib/../app.css');
</script>

{#if $navigating}
	<PreloadingIndicator />
{/if}
<NavMenu />
<main>
	<slot />
</main>

{#if $session.errors}
	<ErrHint errors={$session.errors} />
{/if}
