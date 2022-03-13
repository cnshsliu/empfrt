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
	import { setupI18n, isLocaleLoaded, locale, dir, _ } from '$lib/i18n';
	import { Container } from 'sveltestrap';
	import Confirm from '$lib/confirm.svelte';
	import { printing } from '$lib/Stores';
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
	let theConfirm;
	let browserLocale = '';

	onMount(async () => {
		let tmp = $filterStorage.locale;
		if (tmp) {
			await setI18N(tmp);
			if (window) {
				browserLocale = window.navigator.language;
				if (browserLocale !== tmp && !$filterStorage.confirmlocale) {
					theConfirm.title = $_('confirm.locale.langchanged.title');
					theConfirm.body = $_('confirm.locale.langchanged.body', {
						values: { browserlang: browserLocale }
					});
					theConfirm.buttons = [
						$_('confirm.locale.langchanged.button1'),
						$_('confirm.locale.langchanged.button2', { values: { currentlang: tmp } })
					];
					theConfirm.callbacks = [
						async () => {
							$filterStorage.locale = browserLocale;
						},
						async () => {
							$filterStorage.confirmlocale = true;
						}
					];
					theConfirm.toggle();
				}
			}
		} else {
			if (window) {
				browserLocale = window.navigator.language;
				$filterStorage.locale = browserLocale;
				await setI18N($filterStorage.locale);

				theConfirm.title = $_('confirm.locale.usedefault.title');
				theConfirm.body = $_('confirm.locale.usedefault.body', {
					values: { browserlang: browserLocale }
				});
				theConfirm.buttons = [$_('confirm.locale.usedefault.confirm')];
				theConfirm.callbacks = [async () => {}];
				theConfirm.toggle();
			}
		}
		const module = await import('bootstrap');
		bootstrap = module.default;
	});

	const setI18N = async function (locale) {
		if (['en', 'zh-CN'].includes(locale) === false) {
			if (locale.indexOf('-') > 0) {
				await setI18N(locale.substring(0, locale.indexOf('-')));
			} else {
				await setI18N('en');
			}
		} else {
			console.log('I18N: ', locale);
			await setupI18n({ withLocale: locale });
		}
	};

	//Reset locale on user pickup
	$: if ($filterStorage.locale) {
		setTimeout(async () => {
			await setI18N($filterStorage.locale);
		});
	}
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
<!-- for global notification purpose, wrap other component into this Notifications component -->
<Notifications>
	{#if $isLocaleLoaded}
		<!-- on printing, hide the NavMenu -->
		{#if $printing === false}
			<NavMenu />
		{/if}
		<main>
			<slot />
		</main>
		<!-- on page of single business item, hide EmpRoot -->
		{#if page.path.startsWith('/template/@') || page.path.startsWith('/workflow/@') || page.path.startsWith('/work/@')}
			&nbsp;
		{:else}
			<EmpFooter />
		{/if}
	{:else}
		<Container class="w-100 text-center mt-5 pt-5">
			<p>Loading...</p>
			<div class="spinner w-100">&nbsp;</div>
		</Container>
	{/if}
</Notifications>
{#if $session.errors}
	<ErrHint errors={$session.errors} />
{/if}
<Confirm bind:this={theConfirm} />
