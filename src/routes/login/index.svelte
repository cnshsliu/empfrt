<script context="module">
	export async function load({ session }) {
		if (session.user) {
			console.log('Redirect to template');
			return {
				status: 302,
				redirect: '/template'
			};
		}

		return {};
	}
</script>

<script lang="ts">
	import { whichTabStore } from '$lib/empstores';
	import { Container, Row, Col } from 'sveltestrap';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import type { oneArgFunc } from '$lib/types';
	import * as api from '$lib/api';
	import { Input, Card, NavLink } from 'sveltestrap';
	import { getNotificationsContext } from 'svelte-notifications';
	const { addNotification } = getNotificationsContext();
	import Countdown from '$lib/Countdown.svelte';

	let email = '';
	let password = '';
	let show_resend_email_verification = false;
	let theCountdown;

	function setFadeMessage(message: string, type = 'warning', pos = 'bottom-right', time = 2000) {
		(addNotification as oneArgFunc)({
			text: message,
			position: pos,
			type: type,
			removeAfter: time
		});
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
			if (response.user) {
				$session.user = response.user;
				goto('/template');
				whichTabStore.set(null);
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

<Container style="max-width: 400px;">
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
				<div class="form-floating flex-fill">
					<Input
						class="form-control form-control-lg"
						type="email"
						id="input-email"
						required
						autocomplete="username"
						placeholder="Email"
						bind:value={email}
					/>
					<label for="input-email">Your email: </label>
				</div>
				<div class="form-floating flex-fill">
					<Input
						class="form-control form-control-lg mt-2"
						id="input-password"
						type="password"
						required
						placeholder="Password"
						autocomplete="current-password"
						bind:value={password}
					/>
					<label for="input-password">Password: </label>
				</div>
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
	</Row>
</Container>
