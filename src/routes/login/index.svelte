<script context="module">
	export async function load({ session }) {
		if (session.user) {
			return {
				status: 302,
				redirect: '/template'
			};
		}

		return {};
	}
</script>

<script lang="ts">
	import { _ } from '$lib/i18n';
	import { Container, Row, Col } from 'sveltestrap';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import type { oneArgFunc, EmpResponse } from '$lib/types';
	import * as api from '$lib/api';
	import { Input, Card, NavLink } from 'sveltestrap';
	import { getNotificationsContext } from 'svelte-notifications';
	const { addNotification } = getNotificationsContext();
	import Countdown from '$lib/Countdown.svelte';

	let email = '';
	let password = '';
	let show_resend_email_verification = false;
	let theCountdown;
	let login_wait = -1;
	let login_wait_interval = null;
	let errResponse: any = { error: '', message: '' };
	let isUserValid = '';
	let isPwdValid = '';

	function setFadeMessage(message: string, type = 'warning', pos = 'bottom-right', time = 2000) {
		(addNotification as oneArgFunc)({
			text: message,
			position: pos,
			type: type,
			removeAfter: time
		});
	}
	async function submit(event) {
		isUserValid = '';
		isPwdValid = '';
		errResponse = { error: '', message: '' };
		const response = (await post(`auth/login`, { email, password })) as unknown as EmpResponse;

		if (response.error) {
			if (response.error === 'NO_BRUTE') {
				login_wait = 10;
				if (login_wait_interval) {
					clearInterval(login_wait_interval);
				}
				login_wait_interval = setInterval(() => {
					login_wait--;
					if (login_wait < 0) clearInterval(login_wait_interval);
				}, 1000);
			}
			errResponse = response;
			if (response.error === 'login_no_user') {
				isUserValid = ' is-invalid';
				isPwdValid = '';
			} else {
				isUserValid = '';
				isPwdValid = ' is-invalid';
			}
			if (response.error === 'login_emailVerified_false') {
				show_resend_email_verification = true;
				//resendCountdown = 0;
				//theCountdown.reset(0);
			}
		} else {
			login_wait = -1;
			if (response.user) {
				$session.user = response.user;
				goto('/template');
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
			<h1 class="text-center">
				{$_('account.signin')}
			</h1>
		</Col>
		<Col>
			<p class="text-center">
				<a href="/register"> {$_('account.needAnAccount')}</a>
			</p>
		</Col>
		<Col>
			<form on:submit|preventDefault={submit}>
				<div class="form-floating flex-fill">
					<Input
						class={'form-control form-control-lg ' + isUserValid}
						id="input-email"
						name="email"
						required
						autocomplete="username"
						placeholder="Email"
						bind:value={email}
						aria-describedby="validationServerUsernameFeedback"
					/>
					<label for="input-email"> {$_('account.yourEmail')} </label>
					<div id="validationServerUsernameFeedback" class="invalid-feedback">
						{#if errResponse.error && errResponse.message}
							{errResponse.message}
						{/if}
					</div>
				</div>
				<div class="form-floating flex-fill has-validation">
					<Input
						class={'form-control form-control-lg mt-2 ' + isPwdValid}
						id="input-password"
						type="password"
						required
						placeholder="Password"
						autocomplete="current-password"
						bind:value={password}
						aria-describedby="validationServerPwdFeedback"
					/>
					<label for="input-password"> {$_('account.password')}</label>
					<div id="validationServerPwdFeedback" class="invalid-feedback">
						{#if errResponse.error && errResponse.message}
							{errResponse.message}
						{/if}
					</div>
				</div>
				<div class="w-100 d-flex justify-content-end">
					<button
						class="w-100 btn btn-lg btn-primary pull-xs-right mt-3"
						type="submit"
						disabled={login_wait >= 0}
					>
						{$_('account.signin')}
						{login_wait < 0 ? '' : `(${login_wait})`}
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
				>
					Resend Verification Email
				</NavLink>
			{:else if resendCountdown > 0}
				<svelte:component this={Countdown} bind:this={theCountdown} bind:resendCountdown />
			{/if}
		</Col>
	</Row>
</Container>
