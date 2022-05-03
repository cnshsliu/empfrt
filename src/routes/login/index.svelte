<script context="module">
	export async function load({ session }) {
		if (session.user) {
			return {
				status: 302,
				redirect: '/work'
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
	import { setFadeMessage } from '$lib/Notifier';
	import type { oneArgFunc, EmpResponse } from '$lib/types';
	import * as api from '$lib/api';
	import { Input, Card, NavLink } from 'sveltestrap';
	import { filterStorage } from '$lib/empstores';
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
	let showResetPassword = false;
	let passwordErrorCount = 0;
	let resetPasswordResult = '';

	async function submit(event) {
		isUserValid = '';
		isPwdValid = '';
		errResponse = { error: '', message: '' };
		const response = (await post(`auth/login`, { email, password })) as unknown as EmpResponse;

		if (response.error) {
			if (response.error === 'NO_BRUTE') {
				login_wait = 10;
				showResetPassword = true;
				resetPasswordResult = '';
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
				passwordErrorCount++;
			}
			if (response.error === 'login_emailVerified_false') {
				show_resend_email_verification = true;
				//resendCountdown = 0;
				//theCountdown.reset(0);
			}
		} else {
			login_wait = -1;
			if (response.user) {
				delete $filterStorage.doer;
				$session.user = response.user;
				goto('/work');
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

	let needFullEmailToResetPassword = '';
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
				{#if needFullEmailToResetPassword}
					{needFullEmailToResetPassword}
				{/if}
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
		{#if showResetPassword}
			<Col class="text-center mt-5">
				<NavLink
					on:click={() => {
						//检查是否为完整邮箱地址
						if (email.indexOf('@') < 0 || email.match(/^[^@]+@[^@]+$/) === null) {
							//如非完整地址，提醒用户
							needFullEmailToResetPassword = $_('login.needfullemail');
						} else {
							//如为完整地址，则发送重置邮件
							needFullEmailToResetPassword = '';
							$session.rstPwdFor = email;
							goto('/resetpassword');
						}
					}}
				>
					{$_('login.reset_password')}
				</NavLink>
			</Col>
		{/if}
		{#if resetPasswordResult}
			<Col class="text-center mt-5">
				{resetPasswordResult}
			</Col>
		{/if}
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
