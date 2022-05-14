<script context="module" lang="ts">
	import { setupI18n, isLocaleLoaded, locale, dir, _ } from '$lib/i18n';
	export async function load({ url, params, session }) {
		const { user } = session;
		if (/^\/settings\/(.*)/.test(url.pathname) && !user) {
			return { redirect: '/', status: 302 };
		}
		return {
			props: {
				url,
			},
		};
	}
</script>

<script lang="ts">
	import { Container } from 'sveltestrap';
	import Confirm from '$lib/confirm.svelte';
	import { printing, notifyMessage, mtcConfirm, mtcConfirmReset } from '$lib/Stores';
	import { filterStorage } from '$lib/empstores';
	import { navigating, session } from '$app/stores';
	import { onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';
	import Transition from '$lib/Transition.svelte';
	import { DEPLOY_MODE } from '$lib/Env';
	import NavMenu from '$lib/NavMenu.svelte';
	import EmpFooter from '$lib/EmpFooter.svelte';
	import PreloadingIndicator from '$lib/PreloadingIndicator.svelte';
	export let url;

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
					$mtcConfirm = {
						title: $_('confirm.locale.langchanged.title'),
						body: $_('confirm.locale.langchanged.body', {
							values: { browserlang: browserLocale },
						}),
						buttons: [
							$_('confirm.locale.langchanged.button1'),
							$_('confirm.locale.langchanged.button2', { values: { currentlang: tmp } }),
						],
						callbacks: [
							async () => {
								$filterStorage.locale = browserLocale;
								mtcConfirmReset();
							},
							async () => {
								$filterStorage.confirmlocale = true;
								mtcConfirmReset();
							},
						],
					};
				}
			}
		} else {
			if (window) {
				browserLocale = window.navigator.language;
				$filterStorage.locale = browserLocale;
				await setI18N($filterStorage.locale);

				theConfirm.title = $_('confirm.locale.usedefault.title');
				theConfirm.body = $_('confirm.locale.usedefault.body', {
					values: { browserlang: browserLocale },
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
			await setupI18n({ withLocale: locale });
		}
	};

	//Reset locale on user pickup
	$: if ($filterStorage.locale) {
		setTimeout(async () => {
			await setI18N($filterStorage.locale);
		});
	}

	let showNotify = false;
	let notifyTimeout = null;

	$: $notifyMessage.message !== '' &&
		(() => {
			showNotify = true;
			if (notifyTimeout) {
				clearTimeout(notifyTimeout);
				notifyTimeout = null;
			}
			notifyTimeout = setTimeout(async () => {
				$notifyMessage.message = '';
				showNotify = false;
				notifyTimeout = null;
			}, 3000);
		})();
	$: $mtcConfirm.title != '' &&
		(() => {
			theConfirm.title = $mtcConfirm.title;
			theConfirm.body = $mtcConfirm.body;
			theConfirm.buttons = $mtcConfirm.buttons;
			theConfirm.callbacks = $mtcConfirm.callbacks;
			theConfirm.toggle();
		})();
</script>

<svelte:head>
	{#if ['private', 'intranet', 'privatecloud'].includes(new String(DEPLOY_MODE).toLowerCase())}
		<link href="/css/bootstrap/dist/bootstrap.min.css" rel="stylesheet" />
	{:else}
		<link
			href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
			rel="stylesheet"
			integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
			crossorigin="anonymous" />
	{/if}
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.2/font/bootstrap-icons.css" />
	<link rel="stylesheet" href="/css/app.css" />
</svelte:head>

{#if $navigating}
	<PreloadingIndicator />
{/if}
{#if showNotify}
	<div class={'text-center fixed-bottom fs-3 bg-' + $notifyMessage.type}>
		{$notifyMessage.message}
	</div>
{/if}
<!-- for global notification purpose, wrap other component into this Notifications component -->
{#if $isLocaleLoaded}
	<!-- on printing, hide the NavMenu -->
	{#if $printing === false}
		<NavMenu />
	{/if}
	<main><slot /></main>
	<!-- on page of single business item, hide EmpRoot -->
	{#if url.pathname.startsWith('/template/') || url.pathname.startsWith('/workflow/') || url.pathname.startsWith('/work/')}
		&nbsp;
	{:else}
		<EmpFooter />
	{/if}
{:else}
	<Container class="w-100 text-center " style="height:100vh;">
		<div class="runninglogo w-100">&nbsp;</div>
	</Container>
{/if}
<Confirm bind:this={theConfirm} />
