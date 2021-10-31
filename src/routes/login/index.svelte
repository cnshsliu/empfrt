<script context="module">
	export async function load({ session }) {
		if (session.user) {
			return {
				status: 302,
				redirect: '/'
			};
		}

		return {};
	}
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import * as api from '$lib/api';
	import { Fade, Card, NavLink } from 'sveltestrap';
	import Countdown from '$lib/Countdown.svelte';

	let email = '';
	let password = '';
	let errors = null;
	let fade_message = '';
	let fade_timer;
	let show_resend_email_verification = false;
	let theCountdown;

	function setFadeMessage(message) {
		fade_message = message;
		if (fade_timer) clearTimeout(fade_timer);
		fade_timer = setTimeout(() => {
			fade_message = '';
		}, 2000);
	}
	async function submit(event) {
		const response = await post(`auth/login`, { email, password });

		if (response.error) {
			setFadeMessage(response.message);
			if (response.error === 'login_emailVerified_false') {
				show_resend_email_verification = true;
				//resendCountdown = 0;
				//theCountdown.reset(0);
			}
		} else {
			setFadeMessage('');
		}

		if (response.user) {
			$session.user = response.user;
			goto('/work');
		}
	}

	let resendCountdown = 0;
	async function resendEmailVerification() {
		resendCountdown = 10;
		const response = await api.post('account/evc', { email });
		if (response.error) {
			setFadeMessage(response.message);
		} else {
			setFadeMessage('Please check your mailbox');
		}
	}
</script>

<svelte:head>
	<title>Sign in • HyperFlow</title>
</svelte:head>

<div class="auth-page">
	<div class="container page">
		<div class="row">
			<div class="col-md-6 offset-md-3 col-xs-12">
				<h1 class="text-center">Sign In</h1>
				<p class="text-center">
					<a href="/register">Need an account?</a>
				</p>

				<form on:submit|preventDefault={submit}>
					<fieldset class="form-group">
						<input
							class="form-control form-control-lg"
							type="email"
							required
							placeholder="Email"
							bind:value={email}
						/>
					</fieldset>
					<fieldset class="form-group">
						<input
							class="form-control form-control-lg"
							type="password"
							required
							placeholder="Password"
							bind:value={password}
						/>
					</fieldset>
					<button class="btn btn-lg btn-primary pull-xs-right mt-2" type="submit"> Sign in </button>
				</form>
				{#if show_resend_email_verification && resendCountdown < 1}
					<NavLink
						on:click={() => {
							resendEmailVerification();
						}}>Resend Verification Email</NavLink
					>
				{:else if resendCountdown > 0}
					<svelte:component this={Countdown} bind:this={theCountdown} bind:resendCountdown />
				{/if}
				<Fade isOpen={fade_message != ''}>
					<Card body>
						{fade_message}
					</Card>
				</Fade>
			</div>
		</div>
	</div>
</div>
