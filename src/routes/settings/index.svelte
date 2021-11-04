<script context="module">
	import * as api from '$lib/api';
	export async function load({ session }) {
		const { user } = session;
		if (!user) {
			console.log('setting redict to login');
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
		console.log(JSON.stringify(myorg));

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
	import { onMount, onDestroy } from 'svelte';
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
		Label,
		Card,
		CardBody,
		CardFooter,
		CardHeader,
		CardSubtitle,
		CardText,
		CardTitle
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
	async function logout() {
		await post(`auth/logout`);

		// this will trigger a redirect, because it
		// causes the `load` function to run again
		$session.user = null;
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
			myorg.joincode = generatedJoinCode;
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
			myorg.joincode = generatedJoinCode;
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

	let password_for_admin = '';

	async function approveJoinOrgApplications() {
		let ems = myorg.joinapps
			.filter((x) => x.checked)
			.map((x) => x.user_email)
			.join(':');
		let res = await api.post(
			'tnt/approve',
			{ ems, password: password_for_admin },
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
		console.log(myorg.joinapps);
		if (myorg && myorg.joinapps && Array.isArray(myorg.joinapps)) {
			for (let i = 0; i < myorg.joinapps.length; i++) {
				myorg.joinapps[i].checked = true;
			}
		}
	}

	let orgMembers;
	async function refreshMembers() {
		orgMembers = await api.post('tnt/members', {}, user.sessionToken);
		console.log(orgMembers);
		if (orgMembers && orgMembers.members && orgMembers.members.length > 0) {
			orgMembers.members = orgMembers.members.filter((x) => x.email !== user.email);
			orgMembers.members.unshift({ email: user.email, username: user.username });
			for (let i = 0; i < orgMembers.members.length; i++) {
				orgMembers.members[i].checcked = false;
			}
		}
	}

	async function showTab(tabId) {
		if (tabId === 'org') {
			refreshMyOrg();
		} else if (tabId === 'members') {
			refreshMembers();
		}
	}

	onMount(() => {
		refreshMyOrg();
		refreshMembers();
	});

	async function removeSelectedMembers() {
		let ems = orgMembers.members
			.filter((x) => x.email !== user.email)
			.filter((x) => x.checked)
			.map((x) => x.email)
			.join(':');
		let res = await api.post(
			'tnt/member/remove',
			{ ems, password: password_for_admin },
			user.sessionToken
		);
		if (res.error) {
			setFadeMessage(res.message);
		} else {
			refreshMembers();
		}
	}

	let invitation;

	async function sendInvitation() {
		let emails = invitation.split(/[ ;,]/).filter((x) => x.length > 0);
		console.log(emails);
		await api.post('tnt/send/invitation', { ems: emails.join(':') }, user.sessionToken);
	}
</script>

<svelte:head>
	<title>Settings • HyperFlow</title>
</svelte:head>
<Container class="mt-3">
	<TabContent
		on:tab={(e) => {
			showTab(e.detail);
		}}
	>
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
								class="btn btn-lg  pull-xs-right"
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
		<TabPane tabId="org" tab="Org" active>
			<Card class="mt-3">
				<CardHeader><CardTitle>My Orgniazation</CardTitle></CardHeader>
				<CardBody>
					<InputGroup>
						<InputGroupText>Set Org Name to:</InputGroupText>
						<Input bind:value={orgname} placeholder="Orgniazation name" />
						<Button
							on:click={(e) => {
								e.preventDefault();
								setMyTenantName();
							}}
						>
							Set
						</Button>
					</InputGroup>
				</CardBody>
			</Card>
			{#if myorg.adminorg}
				<Card class="mt-5">
					<CardHeader><CardTitle>Joincode</CardTitle></CardHeader>
					<CardBody>
						<div class="w-100 d-flex align-content-center">Current code: {myorg.joincode}</div>
						<InputGroup>
							<InputGroupText>Generated Join Code</InputGroupText>
							<Input bind:value={generatedJoinCode} />
							<Button
								on:click={(e) => {
									e.preventDefault();
									generateJoinCode();
								}}
							>
								Generate
							</Button>
						</InputGroup>
						<InputGroup>
							<InputGroupText>Self-defined Join Code</InputGroupText>
							<Input bind:value={userDefinedJoinCode} />
							<Button
								on:click={(e) => {
									e.preventDefault();
									setUserDefinedJoinCode();
								}}
							>
								Use it
							</Button>
						</InputGroup>
					</CardBody>
				</Card>
				<Card class="mt-3">
					<CardHeader>
						<CardTitle>Invite</CardTitle></CardHeader
					>
					<CardBody>
						<InputGroup>
							<Input
								type="textarea"
								bind:value={invitation}
								placeholder="Email list to invite, separated by space or comma or semicolon"
							/>
							<Button
								on:click={(e) => {
									sendInvitation();
								}}>Invite</Button
							>
						</InputGroup>
					</CardBody>
				</Card>
				<Card class="mt-3">
					<CardHeader>
						<CardTitle>Join applications</CardTitle></CardHeader
					>
					<CardBody>
						<Button
							color="secondary"
							on:click={(e) => {
								e.preventDefault();
								refreshMyOrg();
							}}
						>
							Refresh
						</Button>
						{#if myorg.joinapps && Array.isArray(myorg.joinapps) && myorg.joinapps.length > 0}
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
								<Input
									type="password"
									bind:value={password_for_admin}
									placeholder="Confirm with your password"
								/>
								<Button
									on:click={(e) => {
										e.preventDefault();
										approveJoinOrgApplications();
									}}
								>
									Approve
								</Button>
							</InputGroup>
						{:else}
							There is no join application at this moment
						{/if}
					</CardBody>
				</Card>
			{:else}
				This orgnization is under PRIVATE mode,
			{/if}
		</TabPane>
		<TabPane tabId="members" tab="Members">
			<h1 class="text-xs-center">Members</h1>
			{#if myorg.adminorg === false}
				This is a PRIVTATE orgnization, the only member is youself.
			{:else if orgMembers && orgMembers.members && orgMembers.members.length > 0}
				<Container>
					<Row cols="1" />
					<Col>
						<table class="w-100">
							<thead>
								<tr> <th> Email</th> <th> {orgMembers.adminorg ? 'Remove' : ''} </th> </tr>
							</thead>
							<tbody>
								{#each orgMembers.members as member, index (member)}
									<tr
										transition:scale|local={{ start: 0.7 }}
										animate:flip={{ duration: 200 }}
										class:odd={index % 2 !== 0}
										class:even={index % 2 === 0}
									>
										<td data-label="Email">
											{member.email}
										</td>
										<td>
											{#if index > 0}
												<Input type="checkbox" bind:checked={member.checked} />
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</Col>
					<Col class="d-flex justify-content-end mt-2">
						<InputGroup>
							<Input
								type="password"
								bind:value={password_for_admin}
								placeholder="Confirm with your password"
							/>
							<Button
								on:click={(e) => {
									e.preventDefault();
									removeSelectedMembers();
								}}
							>
								Remove selected from my Org
							</Button>
						</InputGroup>
					</Col>
				</Container>
			{/if}
		</TabPane>
	</TabContent>
</Container>
<Fade isOpen={fade_message != ''} class="kfk-fade">
	<Card body>
		{fade_message}
	</Card>
</Fade>

<style>
	.odd {
		background-color: #f7f7f7;
	}
</style>
