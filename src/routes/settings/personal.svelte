<script type="ts">
	import { Button, Container, Row, Col, InputGroup, InputGroupText, Input } from 'sveltestrap';
	import { session } from '$app/stores';
	import type { User, EmpResponse } from '$lib/types';
	import { post } from '$lib/utils';
	import * as api from '$lib/api';
	export let user: User;
	export let setFadeMessage: any;
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
</script>

<form>
	<Container class="mt-3">
		<div class="w-100 text-center fs-3">{user.email}</div>
		<Row cols="1" class="mt-3">
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>Current password:</InputGroupText>
					<input
						class="form-control"
						type="password"
						placeholder="Old Password"
						bind:value={my_old_password}
					/>
				</InputGroup>
			</Col>
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>Your avatar url</InputGroupText>
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
						Set
					</Button>
				</InputGroup>
			</Col>
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>Your display name:</InputGroupText>
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
						Set
					</Button>
				</InputGroup>
			</Col>
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>Change password:</InputGroupText>
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
						Set
					</Button>
				</InputGroup>
			</Col>
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>Send Email to me on new work comming</InputGroupText> &nbsp;&nbsp;
					<span class="form-control">
						<Input type="checkbox" bind:checked={user.ew} />
					</span>
					<Button
						on:click={async (e) => {
							e.preventDefault();
							await setPersonal({ ew: user.ew });
						}}
					>
						Set
					</Button>
				</InputGroup>
			</Col>
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>Page Size</InputGroupText> &nbsp;&nbsp;
					<span class="form-control">
						<Input type="number" bind:value={user.ps} step="10" min="10" max="100" />
					</span>
					<Button
						on:click={async (e) => {
							e.preventDefault();
							await setPersonal({ ps: user.ps });
						}}
					>
						Set
					</Button>
				</InputGroup>
			</Col>
			<Col>
				<InputGroup class="mb-1">
					<InputGroupText>Join Org with joincode:</InputGroupText>
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
						Set
					</Button>
				</InputGroup>
			</Col>
			<Col class="p-3">My Group: {user.group}</Col>
		</Row>
	</Container>
</form>
