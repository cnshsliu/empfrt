<script type="ts">
	import { Button, Container, Row, Col, InputGroup, InputGroupText, Input } from 'sveltestrap';
	import { session } from '$app/stores';
	import { _ } from '$lib/i18n';
	import FileUploader from '$lib/FileUploader.svelte';
	import type { User, EmpResponse } from '$lib/types';
	import { post } from '$lib/utils';
	import * as api from '$lib/api';
	import InformWebhooks from './InformWebhooks.svelte';
	export let user: User;
	export let setFadeMessage: any;
	let uploadingFile: boolean;
	let uploadedFiles = [];
	let joinorgwithcode = '';
	const joinOrgWithCode = async function () {
		let res = await api.post('tnt/join', { joincode: joinorgwithcode }, user.sessionToken);
		if (res.error) setFadeMessage(res.message, 'warning');
	};

	let password_for_admin = '';
	let my_old_password = '';
	let set_group_to = '';
	let menu = '';
	let in_progress = false;

	//////////////////////////////////////////////////
	//Compatible with old ew which is a boolean value
	//////////////////////////////////////////////////
	if (typeof user.ew === 'boolean') {
		user.ew = { email: user.ew, wecom: false };
	}

	const setPersonal = async function (value) {
		in_progress = true;
		let payload = {
			value: value,
			old_password: my_old_password
		};
		const response = (await post('auth/save', payload)) as unknown as EmpResponse;
		if (response.error) {
			if (response.error === 'Bad Request' && response.message.indexOf('old_password') > -1) {
				if (response.message.indexOf('fails to match') > -1) {
					response.message = 'The current password does not match required format';
				} else {
					response.message = response.message.replace('old_password', 'Current password');
				}
			}
			setFadeMessage(response.error + ': ' + response.message);
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
</script>

<form>
	<Container class="mt-3">
		<div class="w-100 text-center fs-3">
			{user.email}
			<br />
			{user.group}
		</div>
		<Row cols="1" class="mt-3">
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>{$_('setting.personal.avatar')}</InputGroupText>
					<img alt="avatar" src={`${user.avatar}`} class="kfk-avatar-small" />
					<input
						class="form-control"
						type="text"
						placeholder="URL of profile picture"
						bind:value={user.avatar}
					/>
					<Button
						on:click={async (e) => {
							e.preventDefault();
							await setPersonal({ avatar: user.avatar });
						}}
					>
						{$_('setting.set')}
					</Button>
				</InputGroup>
			</Col>
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
						bind:value={my_old_password}
					/>
					<InputGroupText>{$_('setting.personal.newpassword')}</InputGroupText>
					<input
						class="form-control"
						type="password"
						placeholder="New Password"
						bind:value={user.password}
					/>
					<Button
						on:click={async (e) => {
							e.preventDefault();
							await setPersonal({ password: user.password });
						}}
					>
						{$_('setting.set')}
					</Button>
				</InputGroup>
				密码格式要求： 1. 总长度6-20之间； 2. 大小写字母、数字、特殊字符三类，每一类均至少包含一个；3.
				特殊字符仅限!@#$%^&*
			</Col>
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
	</Container>
</form>
