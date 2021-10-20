<script context="module">
	export function load({ session }) {
		const { user } = session;

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
	import * as api from '$lib/api';
	import ListErrors from '$lib/ListErrors.svelte';
	import { post } from '$lib/utils';

	export let user;
	let error = '';

	import { title } from '$lib/title';
	$title = 'HyperFlow';
	let in_progress;
	let errors;

	async function logout() {
		await post(`auth/logout`);

		// this will trigger a redirect, because it
		// causes the `load` function to run again
		$session.user = null;
	}

	async function save() {
		in_progress = true;

		try {
			let ret = await api.post(
				'account/profile/update',
				{ email: user.email, username: user.username, password: user.password },
				user.sessionToken
			);
			if (ret.statusCode === 400) {
				if (ret.message.match(/"password".*fails to match/)) {
					console.log('Password format error');
					error = '密码长度必须在6-12之间，包含大小写字母数字及特殊字符';
				} else if (ret.message.match(/"username".*fails to match/)) {
					console.log('Username format error');
					error = '用户名长度必须在4-12之间，且只包含大小写字母和数字';
				}
			} else {
				//eslint-disable-next-line
				if (ret.user) {
					$session.user = ret.user;
					error = '修改用户信息成功';
				} else {
					error = '错误';
				}
			}
			console.log(ret);
		} catch (err) {
			console.log('error found');
		}

		in_progress = false;
	}
</script>

<svelte:head>
	<title>Settings • Conduit</title>
</svelte:head>

<div class="settings-page">
	<div class="container page">
		<div class="row">
			<div class="col-md-6 offset-md-3 col-xs-12">
				<h1 class="text-xs-center">Your Settings</h1>

				<ListErrors {errors} />

				<form on:submit|preventDefault={save}>
					<fieldset>
						<fieldset class="form-group">
							<input
								class="form-control"
								type="text"
								placeholder="URL of profile picture"
								bind:value={user.image}
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
							<textarea
								class="form-control form-control-lg"
								rows="8"
								placeholder="Short bio about you"
								bind:value={user.bio}
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

				{error}
				<hr />

				<button class="btn btn-outline-danger" on:click={logout}> Or click here to logout. </button>
			</div>
		</div>
	</div>
</div>
