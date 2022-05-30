<script lang="ts">
	import { _ } from '$lib/i18n';
	import { session } from '$app/stores';
	import { Button, Container, Row, Col } from 'sveltestrap';
	import type { EmpResponse } from '$lib/types';
	import { goto } from '$app/navigation';
	import type { oneArgFunc } from '$lib/types';
	import { post } from '$lib/utils';
	import * as api from '$lib/api';
	import { setFadeMessage } from '$lib/Notifier';
	import { whichTabStorage } from '$lib/empstores';

	let password: string = '';
	let password2: string = '';
	let errors = null;
	let fade_timer;
	let email = $session.rstPwdFor;

	async function submit(event) {
		if (password !== password2) {
			setFadeMessage('Passwords are not equal');
			return;
		}
		const response: EmpResponse = (await post(`auth/register`, {
			email,
			password,
		})) as unknown as EmpResponse;

		if (response.error) {
			setFadeMessage(response.message);
		}
		//TODO: after reset
	}
	let showSendVerificationCode = true;
	let needFullEmailToResetPassword = '';
	let sendVerificationCodeResult = '';
	let passwordCheckingMsgs = '';
	let password2CheckingMsgs = '';
	let passwordCssClasses: string = '';
	let password2CssClasses: string = '';
	let enableResetButton = false;
	const pwdReg = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/;
	const onInputPassword = function () {
		if (password.match(pwdReg)) {
			passwordCssClasses = 'valid';
			passwordCheckingMsgs = '';
			if (password === password2) {
				password2CheckingMsgs = '';
				enableResetButton = true;
			} else {
				password2CheckingMsgs = $_('setting.personal.password2notsame');
				enableResetButton = false;
			}
		} else {
			if (password.length < 6) {
				passwordCssClasses = 'invalid';
				passwordCheckingMsgs = $_('setting.personal.passwordtooshort');
				enableResetButton = false;
			} else if (password.length > 20) {
				passwordCssClasses = 'invalid';
				passwordCheckingMsgs = $_('setting.personal.passwordtoolong');
				enableResetButton = false;
			} else {
				passwordCssClasses = 'is-invalid';
				passwordCheckingMsgs = $_('setting.personal.passwordhint');
				enableResetButton = false;
			}
		}
	};
	const onInputPassword2 = function () {
		if (password2 !== password) {
			password2CssClasses = 'is-invalid';
			password2CheckingMsgs = $_('setting.personal.password2notsame');
			enableResetButton = false;
		} else {
			if (password.match(pwdReg)) {
				passwordCssClasses = 'valid';
				password2CssClasses = 'valid';
				passwordCheckingMsgs = '';
				password2CheckingMsgs = '';
				enableResetButton = true;
			} else {
				passwordCssClasses = 'is-invalid';
				passwordCheckingMsgs = $_('setting.personal.passwordhint');
				enableResetButton = false;
			}
		}
	};
	let verifyCodes = ['', '', '', '', '', ''];
	let verifyInputs = [null, null, null, null, null, null];
	let verifyCodeHas6Chars = false;
	let showDirectLogin = false;
	let finalErrMsg = '';
	let sendVerificationCodeError = '';

	let resendCountdown = 0;
	let countDownInterval: any;
</script>

<svelte:head>
	<title>Sign up • HyperFlow</title>
</svelte:head>

<Container style="max-width: 400px;">
	<Row cols="1">
		<Col>
			<h1 class="text-center">{$_('account.resetpassword')}</h1>
		</Col>
		<Col>
			<Row class="form-floating text-center d-flex">
				<input
					class="form-control form-control-lg mt-2"
					id="input-email"
					type="email"
					required
					name="email"
					placeholder="Email"
					bind:value={email} />
				<label for="input-email">{$_('account.yourEmail')}</label>
				{#if needFullEmailToResetPassword}
					<div class="w-100 text-center">{needFullEmailToResetPassword}</div>
				{/if}
				{#if sendVerificationCodeError}
					<div class="w-100 text-center">{sendVerificationCodeError}</div>
				{/if}
			</Row>
			<Row class="d-flex text-center">
				{#if showSendVerificationCode}
					<Button
						class="mt-3"
						color="primary"
						disabled={!email || (email && email.trim().length === 0)}
						on:click={() => {
							showDirectLogin = false;
							finalErrMsg = '';
							if (
								!email ||
								email.indexOf('@') < 0 ||
								email.match(/^[^@]+@[^@]+\.[^@]+$/) === null
							) {
								//如非完整地址，提醒用户
								needFullEmailToResetPassword = $_('login.needfullemail');
							} else {
								api
									.post('account/resetPasswordRequest', {
										email: email,
									})
									.then((res) => {
										if (res.error) {
											needFullEmailToResetPassword = '';
											showSendVerificationCode = true;
											if (res.error === 'USER_NOT_FOUND') {
												sendVerificationCodeResult = '';
												sendVerificationCodeError = $_('account.usernotfound');
											} else {
												sendVerificationCodeResult = '';
												sendVerificationCodeError = $_('account.sendvrfcodeerror');
											}
										} else {
											//发送完成后，提醒用户
											needFullEmailToResetPassword = '';
											sendVerificationCodeResult = $_('account.vrfcodesent');
											showSendVerificationCode = false;
											resendCountdown = 30;
											countDownInterval = setInterval(() => {
												resendCountdown--;
												if (resendCountdown === 0) {
													clearInterval(countDownInterval);
												}
											}, 1000);
										}
									});
							}
						}}>
						{$_('account.sendvrfcode')}
					</Button>
				{:else if sendVerificationCodeResult}
					<div class="w-100 text-center">{sendVerificationCodeResult}</div>
					<Button
						disabled={resendCountdown > 0}
						on:click={() => {
							showDirectLogin = false;
							finalErrMsg = '';
							showSendVerificationCode = true;
							sendVerificationCodeResult = '';
						}}>
						Resend {resendCountdown > 0 ? '(' + resendCountdown + ')' : ''}
					</Button>
				{/if}
			</Row>
			{#if sendVerificationCodeResult}
				<Row class="d-flex text-center mt-3">
					<span class="fs-5">{$_('account.verificationcode')}</span>
				</Row>
				<Row class="d-flex justify-content-evenly">
					{#each verifyCodes as code, codeIndex}
						<div class="m-0 p-0" style="flex: 0 0 0%;">
							<input
								class="form-control m-0 p-0"
								style="text-align:center; width:50px; height:50px; font-size:48px;"
								bind:value={verifyCodes[codeIndex]}
								bind:this={verifyInputs[codeIndex]}
								on:input={(e) => {
									e.preventDefault();
									let tmpvalue = e.target.value;
									tmpvalue = tmpvalue[tmpvalue.length - 1];
									verifyCodes[codeIndex] = tmpvalue;
									if (codeIndex < 5) verifyInputs[codeIndex + 1].focus();
									else verifyInputs[0].focus();

									verifyCodeHas6Chars = verifyCodes.filter((x) => (x ? true : false)).length === 6;
								}} />
						</div>
					{/each}
				</Row>
				{#if verifyCodeHas6Chars && !showDirectLogin}
					<form>
						<div class="form-floating">
							<input
								class="form-control form-control-lg mt-2"
								type="password"
								id="input-password"
								name="new-password"
								required
								placeholder="Password"
								autocomplete="new-password"
								bind:value={password}
								on:input={(e) => {
									e.preventDefault();
									onInputPassword();
								}} />
							<label for="input-password">{$_('account.choosePassword')}</label>
							{passwordCheckingMsgs}
						</div>
						<!-- svelte-ignore missing-declaration -->
						<div class="form-floating">
							<input
								class="form-control form-control-lg mt-2"
								type="password"
								id="input-password-repeat"
								required
								placeholder="Password Repeat"
								autocomplete="new-password"
								bind:value={password2}
								on:input={(e) => {
									e.preventDefault();
									onInputPassword2();
								}} />
							<label for="input-password-repeat">{$_('account.verifyPassword')}</label>
							{password2CheckingMsgs}
						</div>
					</form>
					<button
						class="w-100 btn btn-lg btn-primary pull-xs-right mt-3"
						disabled={enableResetButton === false}
						on:click|preventDefault={(e) => {
							showDirectLogin = false;
							finalErrMsg = '';
							api
								.post('account/resetPassword', {
									email: email,
									password: password,
									vrfcode: verifyCodes.join(''),
								})
								.then((res) => {
									if (res.error) {
										showDirectLogin = false;
										switch (res.error) {
											case 'VRFCODE_NOT_FOUND':
												finalErrMsg = $_('account.resetPassword.vrfcode_not_found');
												break;
											case 'USER_NOT_FOUND':
												finalErrMsg = $_('account.resetPassword.user_not_found');
												break;
										}
									} else {
										showDirectLogin = true;
									}
								});
						}}>
						{$_('account.changepassword')}
					</button>
				{/if}
				<!-- if verification code input 6 chars -->
			{/if}
			<!-- if verification code sent -->
		</Col>
		{#if showDirectLogin}
			<Col class="d-flex justify-content-center mt-3">
				<a
					href={'#'}
					class="nav-link fs-3"
					on:click|preventDefault={async (e) => {
						await post(`/auth/logout`);

						whichTabStorage.set(null);
						try {
							localStorage.clear();
						} catch (e) {}

						// this will trigger a redirect, because it
						// causes the `load` function to run again
						try {
							$session = {};
						} catch (e) {}
						goto('/login');
					}}>
					{$_('account.passwordchanged')}
				</a>
			</Col>
		{:else if finalErrMsg}
			<Col class="d-flex justify-content-center mt-3">
				{finalErrMsg}
			</Col>
		{/if}
	</Row>
</Container>
