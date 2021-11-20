<script context="module" lang="ts">
	export async function load({ page, session }) {
		const { user } = session;
		if (/^\/admin\/(.*)/.test(page.path) && !user) {
			return { redirect: '/', status: 302 };
		}
		return {
			props: {
				page,
				user
			}
		};
	}
</script>

<script lang="ts">
	import { navigating, session } from '$app/stores';
	import NavMenu from '$lib/NavMenu.svelte';
	import EmpFooter from '$lib/EmpFooter.svelte';
	import ErrHint from '$lib/ErrHint.svelte';
	import PreloadingIndicator from '$lib/PreloadingIndicator.svelte';
	import { DEPLOY_MODE } from '$lib/Env';
	import('jquery-ui-dist/jquery-ui.min.css');
	import('$lib/../app.css');
	export let user;
	export let page;
</script>

<svelte:head>
	{#if DEPLOY_MODE === 'private'}
		<link rel="stylesheet" href="/css/bootstrap.min.css" />
		<script src="/js/fontawesome.js"></script>
	{:else}
		<link
			href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
			rel="stylesheet"
			integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
			crossorigin="anonymous"
		/>
		<script src="https://kit.fontawesome.com/a94dcd5b4d.js" crossorigin="anonymous"></script>
	{/if}
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
	<EmpFooter {user} />
{/if}
{#if $session.errors}
	<ErrHint errors={$session.errors} />
{/if}
