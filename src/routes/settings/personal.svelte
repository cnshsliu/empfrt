<script type="ts">
	import { API_SERVER } from '$lib/Env';
	import { Button, Container, Row, Col, InputGroup, InputGroupText, Input } from 'sveltestrap';
	import Avatar from '$lib/display/Avatar.svelte';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { setFadeMessage } from '$lib/Notifier';
	import { _ } from '$lib/i18n';
	import type { User, EmpResponse } from '$lib/types';
	import { post } from '$lib/utils';
	import * as api from '$lib/api';
	let user: User = $session.user;
	let uploadedFiles = [];
	let joinorgwithcode = '';

	let my_old_password = '';
	let in_progress = false;

	//////////////////////////////////////////////////
	//Compatible with old ew which is a boolean value
	//////////////////////////////////////////////////
	if (!user.ew) {
		user.ew = { email: true, wecom: false };
	}
	if (typeof user.ew === 'boolean') {
		user.ew = { email: user.ew, wecom: false };
	}
	let enableChangePasswordButton = false;

	const setPersonal = async function (value) {
		in_progress = true;
		let payload = {
			value: value,
			old_password: my_old_password
		};
		const response = await api.post('account/profile/update', payload, user.sessionToken);
		if (response.error) {
			if (
				response.error === 'Bad Request' &&
				response.message.indexOf('value.password') > -1 &&
				response.message.indexOf('fails to match') > -1
			) {
				setFadeMessage($_('setting.personal.newpassword_wrong'));
				enableChangePasswordButton = false;
			} else if (response.error === 'wrong_password') {
				setFadeMessage($_('setting.personal.old_password_wrong'));
			} else {
				setFadeMessage(response.error + ': ' + response.message);
			}
		} else {
			//eslint-disable-next-line
			if (response.user) {
				$session.user = response.user;
				setFadeMessage('修改用户信息成功', 'success');
			} else {
				setFadeMessage('错误', 'danger');
			}
		}

		in_progress = false;
	};
	const removeSignature = async function (serverId) {
		let ret = await api.post('account/remove/signature', {}, $session.user.sessionToken);
	};
	async function setUserSignature() {
		let ret = await api.post(
			'account/set/signature',
			{ pondfiles: uploadedFiles },
			$session.user.sessionToken
		);
	}
	let webhook_setting = {
		wecombot_key: ''
	};

	let avatarInput;
	let theAvatar;

	let newPasswordCheckingMsgs = '';
	let newPasswordCssClasses: string = 'form-control';
	const pwdReg = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/;
	const onInputNewPassword = function () {
		if (user.password.match(pwdReg)) {
			newPasswordCssClasses = 'form-control valid';
			newPasswordCheckingMsgs = '';
			enableChangePasswordButton = true;
		} else if (user.password.length < 6) {
			newPasswordCssClasses = 'form-control is-invalid';
			newPasswordCheckingMsgs = $_('setting.personal.passwordtooshort');
			enableChangePasswordButton = false;
		} else if (user.password.length > 20) {
			newPasswordCheckingMsgs = $_('setting.personal.passwordtoolong');
			enableChangePasswordButton = false;
		} else {
			newPasswordCssClasses = 'form-control is-invalid';
			newPasswordCheckingMsgs = $_('setting.personal.passwordhint');
			enableChangePasswordButton = false;
		}
	};
	async function uploadAvatar(e: Event) {
		e.preventDefault();
		const formData = new FormData();
		formData.append('avatar', e.target.files[0]);
		try {
			await fetch(`${API_SERVER}/account/upload/avatar`, {
				method: 'POST',
				headers: {
					Authorization: user.sessionToken
				},
				body: formData
			})
				.then((response) => response.json())
				.then(async (result) => {
					if (result.error) {
						setFadeMessage(result.message, 'warning');
					} else {
						setTimeout(async () => {
							theAvatar.refresh();
							//这个数字变化时，NavMenu.svelte中会检测到，然后更新菜单栏中的Avatar
							let acf = $session.avatarChangedFlag;
							$session.avatarChangedFlag = acf ? acf + 1 : 1;
						}, 1);
					}
				})
				.catch((error) => {
					console.error('Error:', error);
					setFadeMessage(error.message, 'warning');
				});
		} catch (err) {
			console.error('Error:', err);
			setFadeMessage(err.message, 'warning');
		}
	}

	const joinOrgWithCode = async function () {
		let res = await api.post('tnt/join', { joincode: joinorgwithcode }, user.sessionToken);
		if (res.error) setFadeMessage(res.message, 'warning');
	};
</script>

<Container class="mt-3">
	<Row>
		<nav aria-label="breadcrumb">
			<ol class="breadcrumb">
				<li class="breadcrumb-item">
					<a
						href={'#'}
						on:click={() => {
							goto('/settings');
						}}
					>
						{$_('navmenu.settings')}
					</a>
				</li>
				<li class="breadcrumb-item active" aria-current="page">{$_('setting.personal.nav')}</li>
			</ol>
		</nav>
	</Row>
	<form>
		<Row cols="1">
			<Col class="w-100 text-center fs-3">
				{user.email}
				<br />
				{user.group}
			</Col>
			<Col class="d-flex justify-content-center mt-2">
				<div>
					<Avatar
						email={user.email}
						uname={user.username}
						style={'avatar40'}
						bind:this={theAvatar}
					/>
				</div>
			</Col>
			<Col class="d-flex justify-content-center mt-2">
				<!-- Input class="form-control" name="file" type="file" bind:files={avatarFiles} / -->
				<img
					class="upload"
					src="/images/camera_upload.png"
					alt=""
					on:click={() => {
						avatarInput.click();
					}}
				/>
			</Col>
			<Col class="d-flex justify-content-center">
				<div
					class="chan"
					on:click={() => {
						avatarInput.click();
					}}
				>
					{$_('setting.personal.chooseavatar')}
				</div>
				<input
					style="display:none;"
					name="file"
					type="file"
					accept=".jpg, .jpeg, .png"
					on:change={async (e) => await uploadAvatar(e)}
					bind:this={avatarInput}
				/>
			</Col>
		</Row>
		<Row cols="1" class="mt-3">
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>{$_('setting.personal.signature')}</InputGroupText>
					<img alt="signature" src={`${user.signature}`} class="kfk-signature" />
					<Input bind:value={user.signature} />
					<Button
						on:click={async (e) => {
							e.preventDefault();
							await setPersonal({ signature: user.signature });
						}}
					>
						{$_('setting.set')}
					</Button>
				</InputGroup>
			</Col>
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>{$_('setting.personal.cn')}</InputGroupText>
					<input
						class="form-control"
						type="text"
						autocomplete="username"
						placeholder="Username"
						bind:value={user.username}
					/>
					<Button
						on:click={async (e) => {
							e.preventDefault();
							await setPersonal({ username: user.username });
						}}
					>
						{$_('setting.set')}
					</Button>
				</InputGroup>
			</Col>
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>{$_('setting.personal.currentpassword')}</InputGroupText>
					<input
						class="form-control"
						type="password"
						placeholder="Old Password"
						autocomplete="current-password"
						bind:value={my_old_password}
					/>
					<InputGroupText>{$_('setting.personal.newpassword')}</InputGroupText>
					<input
						class={newPasswordCssClasses}
						type="password"
						autocomplete="new-password"
						placeholder="New Password"
						bind:value={user.password}
						on:input={(e) => {
							e.preventDefault();
							onInputNewPassword();
						}}
						aria-describedby={'validationNewPasswordFeedback'}
					/>
					<Button
						disabled={enableChangePasswordButton === false}
						on:click={async (e) => {
							e.preventDefault();
							await setPersonal({ password: user.password });
						}}
					>
						{$_('setting.set')}
					</Button>
				</InputGroup>
			</Col>
			{#if newPasswordCssClasses === 'form-control is-invalid'}
				<Col class="d-flex justify-content-end">
					<div class="me-5">
						<div class="me-5">
							{newPasswordCheckingMsgs}
						</div>
					</div>
				</Col>
			{/if}
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>{$_('setting.personal.sendmail')}</InputGroupText> &nbsp;&nbsp;
					<span class="form-control">
						<Input type="checkbox" bind:checked={user.ew.email} />
					</span>
					<Button
						on:click={async (e) => {
							e.preventDefault();
							await setPersonal({ ew: user.ew });
						}}
					>
						{$_('setting.set')}
					</Button>
				</InputGroup>
			</Col>
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>{$_('setting.personal.joincode')}</InputGroupText>
					<Input
						type="text"
						bind:value={joinorgwithcode}
						placeholder="join code"
						autocomplete="off"
					/>
					<Button
						on:click={async (e) => {
							e.preventDefault();
							await joinOrgWithCode();
						}}
					>
						{$_('setting.set')}
					</Button>
				</InputGroup>
			</Col>
		</Row>
	</form>
</Container>

<style>
	.upload {
		display: flex;
		height: 40px;
		width: 40px;
		cursor: pointer;
	}
	.chan {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-flow: column;
	}
</style>
