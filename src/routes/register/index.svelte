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
	import { session } from '$app/stores';
	import { Container, Row, Col } from 'sveltestrap';
	import type { EmpResponse } from '$lib/types';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import { Fade, Card } from 'sveltestrap';
	import ListErrors from '$lib/ListErrors.svelte';

	let username: string = '';
	let email: string = '';
	let password: string = '';
	let errors = null;
	let fade_message = '';
	let fade_timer;

	function setFadeMessage(message) {
		fade_message = message;
		if (fade_timer) clearTimeout(fade_timer);
		fade_timer = setTimeout(() => {
			fade_message = '';
		}, 2000);
	}
	async function submit(event) {
		const response: EmpResponse = await post(`auth/register`, { username, email, password }); //eslint-disable-line

		if (response.error) {
			setFadeMessage(response.message);
		} else {
			setFadeMessage('');
		}

		if (response.user) {
			$session.user = response.user;
			console.log('set session.user to', $session.user);
			goto('/');
		}
	}
</script>

<svelte:head>
	<title>Sign up • HyperFlow</title>
</svelte:head>

<Container class="kfk-login-container">
	<Row cols="1">
		<Col>
			<h1 class="text-center">Sign up</h1>
		</Col>
		<Col>
			<p class="text-center">
				<a href="/login">Have an account?</a>
			</p>
		</Col>
		<Col>
			<form on:submit|preventDefault={submit}>
				<fieldset class="form-group">
					<input
						class="form-control form-control-lg mt-2"
						type="text"
						required
						placeholder="Your Name"
						bind:value={username}
					/>
				</fieldset>
				<fieldset class="form-group">
					<input
						class="form-control form-control-lg mt-2"
						type="email"
						required
						placeholder="Email"
						bind:value={email}
					/>
				</fieldset>
				<fieldset class="form-group">
					<input
						class="form-control form-control-lg mt-2"
						type="password"
						required
						placeholder="Password"
						bind:value={password}
					/>
				</fieldset>
				<button class="w-100 btn btn-lg btn-primary pull-xs-right mt-3"> Sign up </button>
			</form>
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
