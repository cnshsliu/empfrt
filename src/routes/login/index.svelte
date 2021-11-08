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
	import { get } from 'svelte/store';
	import type { Perm, WhichTab } from '$lib/types';
	import { permStore, whichTabStore } from '$lib/empstores';
	import { Container, Row, Col } from 'sveltestrap';
	import { session } from '$app/stores';
	import { invalidate, goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import * as api from '$lib/api';
	import { Fade, Input, Card, NavLink } from 'sveltestrap';
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

			localStorage;

			if (response.user) {
				$session.user = response.user;
				goto('/');
				whichTabStore.set(null);
				permStore.set({ perm64: response.perm });
				console.log('>>>', response.perm);
			}
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

<Container class="kfk-login-container">
	<Row cols="1">
		<Col>
			<h1 class="text-center">Sign In</h1>
		</Col>
		<Col>
			<p class="text-center">
				<a href="/register">Need an account?</a>
			</p>
		</Col>
		<Col>
			<form on:submit|preventDefault={submit}>
				<fieldset class="form-group">
					<Input
						class="form-control form-control-lg"
						type="email"
						required
						autocomplete="username"
						placeholder="Email"
						bind:value={email}
					/>
				</fieldset>
				<fieldset class="form-group">
					<Input
						class="form-control form-control-lg mt-2"
						type="password"
						required
						placeholder="Password"
						autocomplete="current-password"
						bind:value={password}
					/>
				</fieldset>
				<div class="w-100 d-flex justify-content-end">
					<button class="w-100 btn btn-lg btn-primary pull-xs-right mt-3" type="submit">
						Sign in
					</button>
				</div>
			</form>
		</Col>
		<Col>
			{#if show_resend_email_verification && resendCountdown < 1}
				<NavLink
					on:click={() => {
						resendEmailVerification();
					}}
					>Resend Verification Email
				</NavLink>
			{:else if resendCountdown > 0}
				<svelte:component this={Countdown} bind:this={theCountdown} bind:resendCountdown />
			{/if}
		</Col>
		<Col>
			<Fade isOpen={fade_message != ''}>
				<Card body>
					{fade_message}
				</Card>
			</Fade>
		</Col>
	</Row>
</Container>
