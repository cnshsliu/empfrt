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

<script>
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import { Fade, Card } from 'sveltestrap';
	import ListErrors from '$lib/ListErrors.svelte';

	let email = '';
	let password = '';
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
		const response = await post(`auth/login`, { email, password });

		if (response.error) {
			setFadeMessage(response.message);
		} else {
			setFadeMessage('');
		}

		if (response.user) {
			//$session.user = response.user;
			$session.user = null;
			goto('/');
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
				<h1 class="text-xs-center">Sign In</h1>
				<p class="text-xs-center">
					<a href="/register">Need an account?</a>
				</p>

				<ListErrors {errors} />

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
					<button class="btn btn-lg btn-primary pull-xs-right" type="submit"> Sign in </button>
				</form>
				<Fade isOpen={fade_message != ''}>
					<Card body>
						{fade_message}
					</Card>
				</Fade>
			</div>
		</div>
	</div>
</div>
