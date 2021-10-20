<script lang="ts">
	import { navigating, session } from '$app/stores';
	import Nav from '$lib/Nav.svelte';
	import ErrHint from '$lib/ErrHint.svelte';
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

{#if $session.errors}
	<ErrHint errors={$session.errors} />
{/if}
