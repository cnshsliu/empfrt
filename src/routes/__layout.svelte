<script context="module" lang="ts">
	export async function load({ page, session }) {
		const { user } = session;
		if (/^\/admin\/(.*)/.test(page.path) && !user) {
			return { redirect: '/', status: 302 };
		}
		return {
			props: {
				user
			}
		};
	}
</script>

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
<div id="footer">
	<div class="mx-5">Copyright METAtoCome 2021</div>
</div>
{#if $session.errors}
	<ErrHint errors={$session.errors} />
{/if}

<style>
	#footer {
		margin-top: 20px;
		background-color: red;
	}
</style>
