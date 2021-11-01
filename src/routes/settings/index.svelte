<script context="module">
	import * as api from '$lib/api';
	export async function load({ session }) {
		const { user } = session;
		if (!user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}

		let myorg = await api.post('tnt/my/org', {}, user.sessionToken);
		if (myorg && myorg.joinapps && Array.isArray(myorg.joinapps)) {
			for (let i = 0; i < myorg.joinapps.length; i++) {
				myorg.joinapps[i].checked = true;
			}
		}

		return {
			props: { user, myorg }
		};
	}
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { User, KFKError } from '$lib/types';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import {
		Container,
		Row,
		Col,
		Button,
		TabContent,
		TabPane,
		Fade,
		Card,
		InputGroup,
		InputGroupText,
		Input,
		FormGroup,
		Label
	} from 'sveltestrap';

	export let user: User;
	export let myorg;
	let fade_message = '';
	let timeoutID = null;
	let fade_timer: any;
	let input_members = '';
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	let in_progress: boolean;
	let orgname = myorg.orgname;

	interface membersDef {
		email: string;
		displayName?: string;
		status: string;
	}
	let membersToAdd: membersDef[] = [
		{ email: 'liukehong@gmail.com', displayName: 'liugamil', status: 'creating' },
		{ email: 'liukehong@gmail.com', displayName: 'liugamil', status: 'created' },
		{ email: 'liukehong@gmail.com', displayName: 'liugamil', status: 'duplicated' },
		{ email: 'liukehong@gmail.com', displayName: 'liugamil', status: 'failed' }
	];

	function setFadeMessage(message: string, time = 2000) {
		fade_message = message;
		if (fade_timer) clearTimeout(fade_timer);
		fade_timer = setTimeout(() => {
			fade_message = '';
		}, time);
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
	async function setMyTenantName() {
		in_progress = true;

		let ret = await api.post('tnt/name/save', { orgname: orgname }, user.sessionToken);
		if (ret.error) {
			setFadeMessage(ret.message);
		} else {
			//eslint-disable-next-line
			if (ret.user) {
				setFadeMessage('Orgniazation name is set succesfully');
			} else {
				setFadeMessage('Error');
			}
		}

		in_progress = false;
	}

	async function save_new_members() {
		let membersArray = input_members.split('\n');
		membersToAdd = membersArray
			.filter((x) => {
				return x.trim() !== '';
			})
			.map((x) => {
				x = x.trim();
				if (x !== '') {
					let tmp = x.split(':');
					return { email: tmp[0], displayName: tmp[1] ?? '', status: 'Waiting' };
				}
			});
	}

	let generatedJoinCode = '';
	let userDefinedJoinCode = '';
	let joinorgwithcode = '';

	async function generateJoinCode() {
		let res = await api.post('tnt/joincode/new', {}, user.sessionToken);
		if (res.error) {
			setFadeMessage(res.message);
		} else if (res.joincode) {
			fade_message = '';
			generatedJoinCode = res.joincode;
		}
	}

	async function setUserDefinedJoinCode() {
		let res = await api.post(
			'tnt/joincode/save',
			{ joincode: userDefinedJoinCode },
			user.sessionToken
		);
		if (res.error) {
			setFadeMessage(res.message);
		} else if (res.joincode) {
			fade_message = '';
			generatedJoinCode = res.joincode;
		}
	}

	async function joinOrgWithCode() {
		let res = await api.post('tnt/join', { joincode: joinorgwithcode }, user.sessionToken);
		if (res.message) setFadeMessage(res.message);
	}

	let userInfoNotChange = true;

	function onInputChange() {
		userInfoNotChange = false;
		console.log('userInfoNotChange');
	}

	let password_for_approve = '';

	async function approveJoinOrgApplications() {
		let ems = myorg.joinapps
			.filter((x) => x.checked)
			.map((x) => x.user_email)
			.join(':');
		let res = await api.post(
			'tnt/approve',
			{ ems, password: password_for_approve },
			user.sessionToken
		);
		if (res.error) {
			setFadeMessage(res.message);
		} else {
			if (res.joinapps) {
				myorg.joinapps = res.joinapps;
				for (let i = 0; i < myorg.joinapps.length; i++) {
					myorg.joinapps[i].checked = true;
				}
			}
		}
	}

	async function refreshMyOrg() {
		myorg = await api.post('tnt/my/org', {}, user.sessionToken);
		if (myorg && myorg.joinapps && Array.isArray(myorg.joinapps)) {
			for (let i = 0; i < myorg.joinapps.length; i++) {
				myorg.joinapps[i].checked = true;
			}
		}
	}
</script>

<svelte:head>
	<title>Settings • HyperFlow</title>
</svelte:head>
<Container class="mt-3">
	<TabContent>
		<TabPane tabId="personal" tab="Personal">
			<h1 class="text-xs-center">Personel</h1>
			<form on:submit|preventDefault={save}>
				<Container>
					<Row cols="2">
						<Col>
							<input
								class="form-control"
								type="text"
								placeholder="URL of profile picture"
								bind:value={user.avatar}
								on:input={() => {
									onInputChange();
								}}
							/>
						</Col>
						<Col>
							<input
								class="form-control form-control-lg"
								type="text"
								placeholder="Username"
								bind:value={user.username}
								on:input={() => {
									onInputChange();
								}}
							/>
						</Col>
						<Col>
							<input
								class="form-control form-control-lg"
								type="email"
								placeholder="Email"
								bind:value={user.email}
								on:input={() => {
									onInputChange();
								}}
							/>
						</Col>
						<Col>
							<input
								class="form-control form-control-lg"
								type="password"
								placeholder="New Password"
								bind:value={user.password}
								on:input={() => {
									onInputChange();
								}}
							/>
						</Col>
						<Col>
							<button
								class="btn btn-lg btn-primary pull-xs-right"
								type="submit"
								disabled={in_progress || userInfoNotChange}
							>
								Update Settings
							</button>
						</Col>
					</Row>
				</Container>
			</form>
			<Container class="mt-5">
				<Row cols="1">
					<Col>
						<InputGroup>
							<InputGroupText>Join Org with joincode:</InputGroupText>
							<Input bind:value={joinorgwithcode} placeholder="Orgniazation name" />
							<Button
								color="primary"
								on:click={(e) => {
									e.preventDefault();
									joinOrgWithCode();
								}}
							>
								Join
							</Button>
						</InputGroup>
					</Col>
				</Row>
			</Container>
		</TabPane>
		<TabPane tabId="tenant" tab="Org" active>
			<Container class="mt-3">
				<Row cols="1">
					<Col><h1>My Orgniazation</h1></Col>
					<Col>
						<InputGroup>
							<InputGroupText>Set Org Name to:</InputGroupText>
							<Input bind:value={orgname} placeholder="Orgniazation name" />
							<Button
								color="primary"
								on:click={(e) => {
									e.preventDefault();
									setMyTenantName();
								}}
							>
								Set
							</Button>
						</InputGroup>
					</Col>
					<Col class="mt-3 mt-1">
						Current Joincode is : {myorg.joincode}
					</Col>
					<Col class="mt-1">
						<InputGroup>
							<InputGroupText>Generated Join Code</InputGroupText>
							<Input bind:value={generatedJoinCode} />
							<Button
								color="primary"
								on:click={(e) => {
									e.preventDefault();
									generateJoinCode();
								}}
							>
								Generate
							</Button>
						</InputGroup>
					</Col>
					<Col class="mt-1">
						<InputGroup>
							<InputGroupText>Self-defined Join Code</InputGroupText>
							<Input bind:value={userDefinedJoinCode} />
							<Button
								color="primary"
								on:click={(e) => {
									e.preventDefault();
									setUserDefinedJoinCode();
								}}
							>
								Use it
							</Button>
						</InputGroup>
					</Col>
				</Row>
			</Container>
			<Container class="mt-3">
				<Row><Col><h1>Join applications to approve</h1></Col></Row>
				<Row
					><Col class="text-center">
						<Button
							color="secondary"
							on:click={(e) => {
								e.preventDefault();
								refreshMyOrg();
							}}
						>
							Refresh
						</Button>
					</Col></Row
				>
				<table class="w-100">
					<thead>
						<tr> <th>Email</th><th>Name</th><th>Approve</th></tr>
					</thead>
					<tbody>
						{#each myorg.joinapps as appl, index (appl)}
							<tr>
								<td>
									{appl.user_email}
								</td>
								<td>
									{appl.user_name}
								</td>
								<td>
									<Input type="checkbox" bind:checked={appl.checked} />
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<InputGroup>
					<InputGroupText>Confirm with your password:</InputGroupText>
					<Input bind:value={password_for_approve} placeholder="Input your login password" />
					<Button
						color="primary"
						on:click={(e) => {
							e.preventDefault();
							approveJoinOrgApplications();
						}}
					>
						Approve
					</Button>
				</InputGroup>
			</Container>
		</TabPane>
		<TabPane tabId="members" tab="Members">
			<h1 class="text-xs-center">Members</h1>
			<Container>
				<Row cols="1" />
				<Col>
					<FormGroup>
						<Label for="input_members">Paste Members</Label>
						<Input type="textarea" name="text" id="input_members" bind:value={input_members} />
					</FormGroup>
				</Col>
				<Col>
					<Button
						disabled={in_progress}
						on:click={(e) => {
							e.preventDefault();
							save_new_members();
						}}>Save</Button
					>
					{JSON.stringify(membersToAdd)}
				</Col>
				<Col>
					<table class="w-100">
						<thead>
							<tr> <th> Email</th> <th>Display Nme</th> <th> Status </th> </tr>
						</thead>
						<tbody>
							{#each membersToAdd as member, index (member)}
								<tr
									transition:scale|local={{ start: 0.7 }}
									animate:flip={{ duration: 200 }}
									class:odd={index % 2 !== 0}
									class:even={index % 2 === 0}
								>
									<td data-label="Email">
										{member.email}
									</td>
									<td data-label="Display Name">{member.displayName}</td>
									<td> {member.status} </td>
								</tr>
							{/each}
						</tbody>
					</table>
				</Col>
			</Container>
		</TabPane>
	</TabContent>
</Container>
<Fade isOpen={fade_message != ''} class="kfk-fade">
	<Card body>
		{fade_message}
	</Card>
</Fade>
