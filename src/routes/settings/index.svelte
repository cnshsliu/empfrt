<script context="module">
	export function load({ session }) {
		const { user } = session;
		console.log(user);
		if (!user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}

		return {
			props: { user }
		};
	}
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import type { User } from '$lib/types';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import { post } from '$lib/utils';
	import { Fade, Card } from 'sveltestrap';

	export let user: User;
	let fade_message = '';
	let fade_timer: any;

	import { title } from '$lib/title';
	$title = 'HyperFlow';
	let in_progress: boolean;

	async function logout() {
		await post(`auth/logout`, {});

		// this will trigger a redirect, because it
		// causes the `load` function to run again
		$session.user = null;
		console.log($session.user);
		console.log($session);
		goto('/');
	}

	function setFadeMessage(message: string) {
		fade_message = message;
		if (fade_timer) clearTimeout(fade_timer);
		fade_timer = setTimeout(() => {
			fade_message = '';
		}, 2000);
	}

	async function save() {
		in_progress = true;

		let ret = await api.post(
			'account/profile/update',
			{ email: user.email, username: user.username, password: user.password },
			user.sessionToken
		);
		if (ret.error) {
			setFadeMessage(ret.message);
		} else {
			//eslint-disable-next-line
			if (ret.user) {
				$session.user = ret.user;
				setFadeMessage('修改用户信息成功');
			} else {
				setFadeMessage('错误');
			}
		}

		in_progress = false;
	}
</script>

<svelte:head>
	<title>Settings • HyperFlow</title>
</svelte:head>

<div class="settings-page">
	<div class="container page">
		<div class="row">
			<div class="col-md-6 offset-md-3 col-xs-12">
				<h1 class="text-xs-center">Your Settings</h1>

				<form on:submit|preventDefault={save}>
					<fieldset>
						<fieldset class="form-group">
							<input
								class="form-control"
								type="text"
								placeholder="URL of profile picture"
								bind:value={user.avatar}
							/>
						</fieldset>

						<fieldset class="form-group">
							<input
								class="form-control form-control-lg"
								type="text"
								placeholder="Username"
								bind:value={user.username}
							/>
						</fieldset>

						<fieldset class="form-group">
							<input
								class="form-control form-control-lg"
								type="email"
								placeholder="Email"
								bind:value={user.email}
							/>
						</fieldset>

						<fieldset class="form-group">
							<input
								class="form-control form-control-lg"
								type="password"
								placeholder="New Password"
								bind:value={user.password}
							/>
						</fieldset>

						<button
							class="btn btn-lg btn-primary pull-xs-right"
							type="submit"
							disabled={in_progress}
						>
							Update Settings
						</button>
					</fieldset>
				</form>

				<Fade isOpen={fade_message != ''}>
					<Card body>
						{fade_message}
					</Card>
				</Fade>
				<hr />

				<button class="btn btn-outline-danger" on:click={logout}> Or click here to logout. </button>
			</div>
		</div>
	</div>
</div>
