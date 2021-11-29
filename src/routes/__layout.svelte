<script context="module" lang="ts">
	export const ssr = false;
	export async function load({ page, session }) {
		const { user } = session;
		if (/^\/settings\/(.*)/.test(page.path) && !user) {
			return { redirect: '/', status: 302 };
		}
		return {
			props: {
				page
			}
		};
	}
</script>

<script lang="ts">
	import { navigating, session } from '$app/stores';
	import { onMount } from 'svelte';
	import NavMenu from '$lib/NavMenu.svelte';
	import EmpFooter from '$lib/EmpFooter.svelte';
	import ErrHint from '$lib/ErrHint.svelte';
	import PreloadingIndicator from '$lib/PreloadingIndicator.svelte';
	import('jquery-ui-dist/jquery-ui.min.css');
	import('bootstrap/dist/css/bootstrap.min.css');
	import('bootstrap-icons/font/bootstrap-icons.css');
	import('$lib/../app.css');
	export let page;

	let bootstrap: any;
	onMount(async () => {
		console.log('import boostrape...');
		const module = await import('bootstrap');
		bootstrap = module.default;
	});
	import { browser, dev } from '$app/env';
</script>

<svelte:head />

{#if $navigating}
	<PreloadingIndicator />
{/if}
<NavMenu />
<main>
	<slot />
</main>

{#if page.path.startsWith('/template/@') || page.path.startsWith('/workflow/@')}
	&nbsp;
{:else}
	<EmpFooter />
{/if}
{#if $session.errors}
	<ErrHint errors={$session.errors} />
{/if}
