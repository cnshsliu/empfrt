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
			setFadeMessage(response.message);
		}

		if (response.user) {
			$session.user = response.user;
			goto('/');
		}
	}
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
						required
						placeholder="Password"
						bind:value={password}
					/>
					<label for="input-password"> {$_('account.choosePassword')}</label>
				</div>
				<div class="form-floating">
					<input
						class="form-control form-control-lg mt-2"
						type="password"
						id="input-password-repeat"
						required
						placeholder="Password Repeat"
						bind:value={password2}
					/>
					<label for="input-password-repeat"> {$_('account.verifyPassword')}</label>
				</div>
				<button class="w-100 btn btn-lg btn-primary pull-xs-right mt-3">
					{$_('account.signup')}</button
				>
			</form>
		</Col>
	</Row>
</Container>
