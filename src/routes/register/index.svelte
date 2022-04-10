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
	import { session } from '$app/stores';
	import { Container, Row, Col } from 'sveltestrap';
	import type { EmpResponse } from '$lib/types';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import { Fade, Card } from 'sveltestrap';
	import { getNotificationsContext } from 'svelte-notifications';
	const { addNotification } = getNotificationsContext();

	let username: string = '';
	let email: string = '';
	let password: string = '';
	let password2: string = '';
	let errors = null;
	let fade_timer;
	let errMsg = '';

	function setFadeMessage(message: string, type = 'warning', pos = 'bottom-right', time = 2000) {
		(addNotification as oneArgFunc)({
			text: message,
			position: pos,
			type: type,
			removeAfter: time
		});
	}
	async function submit(event) {
		if (password !== password2) {
			setFadeMessage('Passwords are not equal');
			return;
		}
		const response: EmpResponse = (await post(`auth/register`, {
			username,
			email,
			password
		})) as unknown as EmpResponse;

		if (response.error) {
			console.log(response);
			if (response.error === 'NO_FREE_REG') {
				errMsg = email.substring(email.indexOf('@') + 1) + $_('account.nofreereg');
			} else {
				setFadeMessage(response.message);
				errMsg = response.message;
			}
		}

		if (response.user) {
			$session.user = response.user;
			goto('/');
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
				<a href="/login"> {$_('account.haveAnAccount')}</a>
			</p>
		</Col>
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
					/>
					<label for="input-email"> {$_('account.yourEmail')}</label>
				</div>
				<div class="form-floating">
					<input
						class="form-control form-control-lg mt-2"
						type="text"
						id="input-username"
						required
						placeholder="Your display name"
						bind:value={username}
					/>
					<label for="input-username"> {$_('account.yourDisplayName')}</label>
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
						}}
					/>
					<label for="input-password"> {$_('account.choosePassword')}</label>
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
						}}
					/>
					<label for="input-password-repeat"> {$_('account.verifyPassword')}</label>
					{password2CheckingMsgs}
				</div>
				<button
					class="w-100 btn btn-lg btn-primary pull-xs-right mt-3"
					disabled={enableSigninButton === false}
				>
					{$_('account.signup')}</button
				>
			</form>
			{errMsg}
		</Col>
	</Row>
</Container>
