<script context="module" lang="ts">
	import { enhance } from '$lib/form';
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ session }) => {
		if (session.user) {
			return { redirect: '/', status: 302 };
		}
		return {};
	};
</script>

<script lang="ts">
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { session } from '$app/stores';
	import { Container, Row, Col } from 'sveltestrap';
	import type { EmpResponse } from '$lib/types';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import { Fade, Card } from 'sveltestrap';
	import { setFadeMessage } from '$lib/Notifier';

	let username: string = '';
	let email: string = '';
	let password: string = '';
	let password2: string = '';
	let errors = null;
	let fade_timer;
	let errMsg = '';

	let regSuccess = false;
	async function submit(event) {
		if (password !== password2) {
			setFadeMessage('Passwords are not equal');
			return;
		}
		const response: EmpResponse = (await post(`auth/register`, {
			username,
			email,
			password,
		})) as unknown as EmpResponse;

		if (response.error) {
			console.log(response);
			if (response.error === 'NO_FREE_REG') {
				errMsg = email.substring(email.indexOf('@') + 1) + $_('account.nofreereg');
			} else {
				if (response.error === 'MongoServerError') {
					if (response.message.indexOf('duplicate key')) {
						response.message = $_('register.duplicate');
					} else {
						response.message = $_('register.dberror');
					}
				}
				setFadeMessage(response.message);
				errMsg = response.message;
			}
		}

		if (response.user) {
			regSuccess = true;
		}
	}
	let passwordCheckingMsgs = '';
	let password2CheckingMsgs = '';
	let passwordCssClasses: string = '';
	let password2CssClasses: string = '';
	let enableSigninButton = false;
	const pwdReg = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/;
	const onInputPassword = function () {
		if (password.match(pwdReg)) {
			passwordCssClasses = 'valid';
			passwordCheckingMsgs = '';
			if (password === password2) {
				password2CheckingMsgs = '';
				enableSigninButton = true;
			} else {
				password2CheckingMsgs = $_('setting.personal.password2notsame');
				enableSigninButton = false;
			}
		} else {
			if (password.length < 6) {
				passwordCssClasses = 'invalid';
				passwordCheckingMsgs = $_('setting.personal.passwordtooshort');
				enableSigninButton = false;
			} else if (password.length > 20) {
				passwordCssClasses = 'invalid';
				passwordCheckingMsgs = $_('setting.personal.passwordtoolong');
				enableSigninButton = false;
			} else {
				passwordCssClasses = 'is-invalid';
				passwordCheckingMsgs = $_('setting.personal.passwordhint');
				enableSigninButton = false;
			}
		}
	};
	const onInputPassword2 = function () {
		if (password2 !== password) {
			password2CssClasses = 'is-invalid';
			password2CheckingMsgs = $_('setting.personal.password2notsame');
			enableSigninButton = false;
		} else {
			if (password.match(pwdReg)) {
				passwordCssClasses = 'valid';
				password2CssClasses = 'valid';
				passwordCheckingMsgs = '';
				password2CheckingMsgs = '';
				enableSigninButton = true;
			} else {
				passwordCssClasses = 'is-invalid';
				passwordCheckingMsgs = $_('setting.personal.passwordhint');
				enableSigninButton = false;
			}
		}
	};

	const checkFreeReg = async function () {
		console.log('Checking freereg', email);
		let ret = await api.post('check/freereg', { email: email });
		if (ret.error) {
			if (ret.error === 'NO_FREE_REG') {
				errMsg = email.substring(email.indexOf('@') + 1) + $_('account.nofreereg');
			} else {
				errMsg = ret.message as string;
			}
		}
	};
	const emailInputting = function () {
		errMsg = '';
	};
</script>

<svelte:head>
	<title>Sign up • HyperFlow</title>
</svelte:head>

<Container style="max-width: 400px;">
	<Row cols="1">
		<Col>
			<h1 class="text-center">{$_('account.signup')}</h1>
		</Col>
		<Col>
			<p class="text-center">
				<a href="/login">{$_('account.haveAnAccount')}</a>
			</p>
		</Col>
		{#if regSuccess === false}
			<Col>
				<form on:submit|preventDefault={submit}>
					<div class="form-floating">
						<input
							class="form-control form-control-lg mt-2"
							id="input-email"
							type="email"
							required
							name="email"
							placeholder="Email"
							bind:value={email}
							on:change={checkFreeReg}
							on:blur={checkFreeReg}
							on:input={emailInputting} />
						<label for="input-email">{$_('account.yourEmail')}</label>
					</div>
					{#if errMsg === ''}
						<div class="form-floating">
							<input
								class="form-control form-control-lg mt-2"
								type="text"
								id="input-username"
								required
								placeholder="Your display name"
								bind:value={username} />
							<label for="input-username">{$_('account.yourDisplayName')}</label>
						</div>
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
						<button
							class="w-100 btn btn-lg btn-primary pull-xs-right mt-3"
							disabled={enableSigninButton === false}>
							{$_('account.signup')}
						</button>
						<div class="fw-light fs-6">
							<div class="mt-3">{$_('register.emailverifytips')}</div>
							<div class="mt-3">{$_('register.upgradeorgtips')}</div>
						</div>
					{:else}
						<div class="mt-3">
							{errMsg}
							<a
								href={'#'}
								class="btn btn-primary"
								on:click={(e) => {
									errMsg = '';
								}}>
								{$_('register.dismiss')}
							</a>
						</div>
					{/if}
				</form>
			</Col>
		{/if}
		{#if regSuccess}
			<Col class="text-center">
				<div class="mt-3">{username}</div>
				<div class="mt-3">{email}</div>
				<div class="mt-3">{$_('register.success')}</div>
				<button class="btn btn-primary mt-3 w-100" on:click|preventDefault={() => goto('/login')}>
					{$_('register.loginnow')}
				</button>
			</Col>
		{/if}
	</Row>
</Container>
