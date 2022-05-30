<script context="module" lang="ts">
	import * as api from '$lib/api';
	export async function load({ url, params, fetch, session }) {
		const verifyToken = params.verifyToken;
		return {
			props: {
				verifyToken: verifyToken,
			},
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from '$lib/i18n';
	import { post } from '$lib/utils';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { setFadeMessage } from '$lib/Notifier';
	import Countdown from '$lib/Countdown.svelte';
	export let verifyToken: string;
	let theCountdown;
	let email = '';
	let verifyError = null;
	let message = 'YOU_ARE_VERIFYING';
	let showError = false;

	onMount(async () => {
		setTimeout(async () => {
			api.post('account/verifyEmail', { token: verifyToken }).then((res) => {
				if (res.error) {
					showError = true;
					verifyError = res;
					email = res.details;
				} else {
					message = res;
				}
			});
		});
	});

	const needRelogin = async () => {
		showError = false;
		await post(`/auth/logout`);
		try {
			$session = { user: null };
		} catch (e) {}
		goto('/login');
	};
	let resendCountdown = 0;

	async function resendEmailVerification() {
		showError = false;
		resendCountdown = 10;
		const response = await api.post('account/evc', { email });
		if (response.error) {
			setFadeMessage(response.message);
		} else {
			setFadeMessage($_('tips.check_email_please'));
		}
	}
</script>

<div class="container mt-5 text-center">
	{#if verifyError}
		{#if showError}
			<div>
				{$_(`login.verify.error.${verifyError.error}`)}
			</div>
		{/if}
		{#if verifyError.error === 'ACCOUNT_ALREADY_VERIFIED'}
			<div class="mt-3">
				<a class="btn btn-primary" href={'#'} on:click|preventDefault={needRelogin}>
					{$_('login.verify.needRelogin')}
				</a>
			</div>
		{:else if verifyError.error === 'VERIFICATION_CODE_EXPIRED'}
			<div class="mt-3">
				{#if resendCountdown < 1}
					<a
						href={'#'}
						class="btn btn-secondary mt-3"
						on:click={() => {
							resendEmailVerification();
						}}>
						{$_('login.resendverificationemail')}
					</a>
				{:else if resendCountdown > 0}
					<svelte:component this={Countdown} bind:this={theCountdown} bind:resendCountdown />
				{/if}
			</div>
		{/if}
	{:else}
		<div>{$_(`login.verify.message.${message}`)}</div>
		{#if message === 'EMAIL_VERIFIED'}
			<div class="mt-3">
				<a class="btn btn-primary" href={'#'} on:click|preventDefault={needRelogin}>
					{$_('login.verify.needRelogin')}
				</a>
			</div>
		{/if}
	{/if}
</div>
