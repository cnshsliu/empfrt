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
	import { setupI18n, isLocaleLoaded, locale, dir } from '$lib/i18n';
	import { filterStorage } from '$lib/empstores';
	import { navigating, session } from '$app/stores';
	import { onMount } from 'svelte';
	import { DEPLOY_MODE } from '$lib/Env';
	import NavMenu from '$lib/NavMenu.svelte';
	import EmpFooter from '$lib/EmpFooter.svelte';
	import ErrHint from '$lib/ErrHint.svelte';
	import PreloadingIndicator from '$lib/PreloadingIndicator.svelte';
	import Notifications from 'svelte-notifications';
	export let page;

	let bootstrap: any;
	onMount(async () => {
		console.log('import boostrape...');
		const module = await import('bootstrap');
		bootstrap = module.default;
		let tmp = $filterStorage.locale;
		if (tmp !== undefined && tmp !== null) {
			setupI18n({ withLocale: tmp });
		}
	});

	$: if (!$isLocaleLoaded) {
		setupI18n({ withLocale: 'en' });
	}
	$: if ($filterStorage.locale) {
		setupI18n({ withLocale: $filterStorage.locale });
	}
	/* $: {
		document.dir = $dir;
	} */
</script>

<svelte:head>
	{#if ['private', 'intranet', 'privatecloud'].includes(new String(DEPLOY_MODE).toLowerCase())}
		<link href="/css/bootstrap/dist/bootstrap.min.css" rel="stylesheet" />
	{:else}
		<link
			href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
			rel="stylesheet"
			integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
			crossorigin="anonymous"
		/>
	{/if}
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.1/font/bootstrap-icons.css"
	/>
	<link rel="stylesheet" href="/css/app.css" />
</svelte:head>

{#if $navigating}
	<PreloadingIndicator />
{/if}
<Notifications>
	{#if $isLocaleLoaded}
		<NavMenu />
		<main>
			<slot />
		</main>
		{#if page.path.startsWith('/template/@') || page.path.startsWith('/workflow/@')}
			&nbsp;
		{:else}
			<EmpFooter />
		{/if}
	{:else}
		<p>Loading...</p>
	{/if}
</Notifications>
{#if $session.errors}
	<ErrHint errors={$session.errors} />
{/if}
