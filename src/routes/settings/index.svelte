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
	import { get } from 'svelte/store';
	import type { EmpResponse, WhichTab } from '$lib/types';
	import { whichTabStore, permStore } from '$lib/empstores';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { User } from '$lib/types';
	import { onMount } from 'svelte';
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
	let fade_timer: any;
	let input_members = '';
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	let in_progress: boolean;
	let orgname = myorg.orgname;
	let orgtheme = myorg.css;

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

	async function savePersonel() {
		in_progress = true;

		const response = (await post('auth/save', {
			email: user.email,
			username: user.username,
			password: user.password
		})) as unknown as EmpResponse;
		if (response.error) {
			setFadeMessage(response.message);
		} else {
			//eslint-disable-next-line
			if (response.user) {
				$session.user = response.user;
				permStore.set({ perm64: response.perm });
				setFadeMessage('修改用户信息成功');
			} else {
				setFadeMessage('错误');
			}
		}

		in_progress = false;
	}

	async function setMyTenantName() {
		in_progress = true;

		let ret = await api.post(
			'tnt/name/save',
			{ orgname: orgname, password: password_for_admin },
			user.sessionToken
		);
		if (ret.error) {
			setFadeMessage(ret.message);
		} else {
			//eslint-disable-next-line
			if (ret.orgname) {
				setFadeMessage('Orgniazation name is set succesfully');
				$session.user.tenant.name = ret.orgname;
			} else {
				setFadeMessage('Error');
			}
		}

		in_progress = false;
	}
	async function setMyTenantTheme() {
		in_progress = true;

		let ret = await api.post(
			'tnt/theme/save',
			{ css: orgtheme, password: password_for_admin },
			user.sessionToken
		);
		if (ret.error) {
			setFadeMessage(ret.message);
		} else {
			//eslint-disable-next-line
			if (ret.css) {
				setFadeMessage('Orgniazation theme is set succesfully');
				const response = (await post(`auth/refresh`, {})) as unknown as EmpResponse;

				if (response.user) {
					$session.user = response.user;
					permStore.set({ perm64: response.perm });
				}
			} else {
				setFadeMessage('Error');
			}
		}

		in_progress = false;
	}

	let generatedJoinCode = '';
	let userDefinedJoinCode = '';
	let joinorgwithcode = '';

	async function generateJoinCode() {
		let res = await api.post(
			'tnt/joincode/new',
			{ password: password_for_admin },
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

	async function setUserDefinedJoinCode() {
		let res = await api.post(
			'tnt/joincode/save',
			{ joincode: userDefinedJoinCode, password: password_for_admin },
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
	let set_group_to = '';

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
		if (myorg && myorg.joinapps && Array.isArray(myorg.joinapps)) {
			for (let i = 0; i < myorg.joinapps.length; i++) {
				myorg.joinapps[i].checked = true;
			}
		}
	}

	let orgMembers;
	async function refreshMembers() {
		orgMembers = await api.post('tnt/members', {}, user.sessionToken);
		if (orgMembers && orgMembers.members && orgMembers.members.length > 0) {
			orgMembers.members = orgMembers.members.filter((x) => x.email !== user.email);
			orgMembers.members.unshift({ email: user.email, username: user.username, group: user.group });
			for (let i = 0; i < orgMembers.members.length; i++) {
				orgMembers.members[i].checked = false;
			}
		}
		console.log(orgMembers.members);
	}

	let whichTab: WhichTab = get(whichTabStore);
	async function showTab(tabId) {
		if (tabId === 'org') {
			refreshMyOrg();
		} else if (tabId === 'members') {
			refreshMembers();
		}
		whichTab = get(whichTabStore);
		whichTab['setting'] = tabId;
		whichTabStore.set(whichTab);
	}

	onMount(() => {
		refreshMyOrg();
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
			console.log('removeSelectedMembers refreshMembers');
			refreshMembers();
		}
	}

	async function setSelectedGroup() {
		let ems = orgMembers.members
			.filter((x) => x.email !== user.email)
			.filter((x) => x.checked)
			.map((x) => x.email)
			.join(':');
		let res = await api.post(
			'tnt/member/setgroup',
			{ ems, password: password_for_admin, member_group: set_group_to },
			user.sessionToken
		);
		if (res.error) {
			setFadeMessage(res.message);
		} else {
			console.log('setSelectedGroup refreshMembers');
			refreshMembers();
		}
	}

	let invitation;

	async function sendInvitation() {
		let emails = invitation.split(/[ ;,]/).filter((x) => x.length > 0);
		console.log(emails);
		let res = await api.post(
			'tnt/send/invitation',
			{ ems: emails.join(':'), password: password_for_admin },
			user.sessionToken
		);
		if (res.error) {
			setFadeMessage(res.message);
		} else {
			console.log('show Invitation refreshMembers');
			refreshMembers();
		}
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
		<TabPane
			tabId="personal"
			tab="Personal"
			active={!whichTab || whichTab['setting'] === 'personal'}
		>
			<h1 class="text-xs-center">Personel</h1>
			<form on:submit|preventDefault={savePersonel}>
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
					</Row>
					<Row>
						<Col>
							<Button
								class="w-100 btn btn-lg  pull-xs-right"
								type="submit"
								disabled={in_progress || userInfoNotChange}
							>
								Update Settings
							</Button>
						</Col>
					</Row>
				</Container>
			</form>
			<Container class="mt-5">
				<Row cols="1">
					<Col>
						<InputGroup>
							<InputGroupText>Join Org with joincode:</InputGroupText>
							<Input
								type="text"
								bind:value={joinorgwithcode}
								placeholder="join code"
								autocomplete="off"
							/>
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
		<TabPane tabId="org" tab="Org" active={whichTab && whichTab['setting'] === 'org'}>
			Administraotr: {myorg.owner === user.email ? 'Me' : myorg.owner}
			<br />
			My Role: {user.group}
			{#if myorg.adminorg}
				<Card class="mt-3">
					<CardHeader><CardTitle>My Orgnization</CardTitle></CardHeader>
					<CardBody>
						<InputGroup>
							<InputGroupText>Admin Password:</InputGroupText>
							<Input
								type="password"
								bind:value={password_for_admin}
								placeholder="Confirm with your password"
							/>
						</InputGroup>
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
						<InputGroup>
							<InputGroupText>Set Org theme to:</InputGroupText>
							<Input bind:value={orgtheme} placeholder="Your customized theme CSS url" />
							<Button
								on:click={(e) => {
									e.preventDefault();
									setMyTenantTheme();
								}}
							>
								Set
							</Button>
						</InputGroup>
					</CardBody>
				</Card>
			{:else}
				<Card class="mt-3">
					<CardHeader><CardTitle>My Orgnization</CardTitle></CardHeader>
					<CardBody>
						{orgname}
					</CardBody>
				</Card>
			{/if}
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
			{/if}
		</TabPane>
		<TabPane tabId="members" tab="Members" active={whichTab && whichTab['setting'] === 'members'}>
			<h1 class="text-xs-center">Members</h1>
			{#if myorg.adminorg === false}
				{#if myorg.owner === user.email}
					This is a PRIVTATE orgnization, the only member is youself.
				{:else}
					This is an orgnization, member list is available
				{/if}
			{:else if orgMembers && orgMembers.members && orgMembers.members.length > 0}
				<Container>
					<Row cols="1" />
					<Col>
						<table class="w-100">
							<thead>
								<tr>
									<th> Email</th> <th> Group </th> <th> {orgMembers.adminorg ? 'Remove' : ''} </th>
								</tr>
							</thead>
							<tbody>
								{#each orgMembers.members as member, index (member)}
									<tr
										transition:scale|local={{ start: 0.7 }}
										animate:flip={{ duration: 200 }}
										class:kfk-odd={index % 2 !== 0}
										class:kfk-even={index % 2 === 0}
										class:tnt-odd={index % 2 !== 0}
										class:tnt-even={index % 2 === 0}
									>
										<td data-label="Email">
											{member.email}
										</td>
										<td data-label="Group">
											{member.group}
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
					<Col class="d-flex justify-content-end mt-2">
						<InputGroup>
							<Label for="groupSelect">Set group for selected members</Label>
							<Input type="select" name="select" id="groupSelect" bind:value={set_group_to}>
								<option value="ADMIN">Administrator</option>
								<option value="OBSERVER">Observer</option>
								<option value="DOER">Doer</option>
							</Input>
							<Button
								on:click={(e) => {
									e.preventDefault();
									setSelectedGroup();
								}}
							>
								Set selected group
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
