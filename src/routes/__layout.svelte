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
	import { DEPLOY_MODE } from '$lib/Env';
	import NavMenu from '$lib/NavMenu.svelte';
	import EmpFooter from '$lib/EmpFooter.svelte';
	import ErrHint from '$lib/ErrHint.svelte';
	import PreloadingIndicator from '$lib/PreloadingIndicator.svelte';
	export let page;

	let bootstrap: any;
	onMount(async () => {
		console.log('import boostrape...');
		const module = await import('bootstrap');
		bootstrap = module.default;
	});
</script>

<svelte:head>
	{#if DEPLOY_MODE === 'private'}
		<link href="/css/bootstrap/dist/bootstrap.min.css" rel="stylesheet" />
		<link rel="stylesheet" href="/css/bootstrap-icons/font/bootstrap-icons.css" />
	{:else}
		<link
			href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
			rel="stylesheet"
			integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
			crossorigin="anonymous"
		/>
		<link
			rel="stylesheet"
			href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.1/font/bootstrap-icons.css"
		/>
	{/if}
	<link rel="stylesheet" href="/css/app.css" />
</svelte:head>

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
