<script context="module">
	import * as api from '$lib/api';
	import TimeZone from '$lib/Timezone';
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

		let delegationFromMe = [];
		try {
			delegationFromMe = await post('/delegation/fromme');
			for (let i = 0; i < delegationFromMe.length; i++) {
				delegationFromMe[i].checked = false;
			}
		} catch (e) {}

		return {
			props: { user, myorg, delegationFromMe }
		};
	}
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import { browser, dev, mode } from '$app/env';
	import { get } from 'svelte/store';
	import type { EmpResponse, WhichTab } from '$lib/types';
	import { whichTabStore } from '$lib/empstores';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { User } from '$lib/types';
	import { onMount } from 'svelte';
	import moment from 'moment';
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
	export let delegationFromMe;
	let fade_message = '';
	let fade_timer: any;
	let input_members = '';
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	let in_progress: boolean;
	let orgname = myorg.orgname;
	let orgtheme = myorg.css;
	let orgtimezone = myorg.timezone;

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

		let payload = {
			email: user.email,
			avatar: user.avatar,
			username: user.username,
			password: user.password
		};
		console.log(payload);
		const response = (await post('auth/save', payload)) as unknown as EmpResponse;
		if (response.error) {
			setFadeMessage(response.message);
		} else {
			//eslint-disable-next-line
			if (response.user) {
				$session.user = response.user;
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
			'tnt/set/name',
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
			'tnt/set/theme',
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
				}
			} else {
				setFadeMessage('Error');
			}
		}

		in_progress = false;
	}

	async function setMyTenantTimezone() {
		in_progress = true;

		let ret = await api.post(
			'tnt/set/timezone',
			{ timezone: orgtimezone, password: password_for_admin },
			user.sessionToken
		);
		if (ret.error) {
			setFadeMessage(ret.message);
		} else {
			//eslint-disable-next-line
			console.log(ret);
			if (ret.timezone) {
				setFadeMessage('Orgniazation timezone is set succesfully');
				const response = (await post(`auth/refresh`, {})) as unknown as EmpResponse;

				if (response.user) {
					console.log('Refresh User after Tenant TimeZone');
					$session.user = response.user;
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
			'tnt/set/joincode',
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
		if (whichTab) {
			whichTab['setting'] = tabId;
			whichTabStore.set(whichTab);
		}
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

	async function removeSelectedDelegation() {
		let ids = delegationFromMe
			.filter((x) => x.checked)
			.map((x) => x._id)
			.join(':');
		let res = await api.post('undelegate', { ids: ids }, user.sessionToken);
		if (res.error) {
			setFadeMessage(res.message);
		} else {
			delegationFromMe = res;
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

	let new_delegation_enddate, new_delegation_begindate, new_delegation_delegatee;

	async function newDelegation() {
		console.log(new_delegation_delegatee, new_delegation_begindate, new_delegation_enddate);
		let ret = await api.post(
			'delegate',
			{
				delegatee: new_delegation_delegatee,
				begindate: new_delegation_begindate,
				enddate: new_delegation_enddate
			},
			$session.user.sessionToken
		);
		if (ret.error) {
			setFadeMessage(ret.message);
		} else if (ret.length) {
			delegationFromMe = ret;
			for (let i = 0; i < delegationFromMe.length; i++) {
				delegationFromMe[i].checked = false;
			}
		}
	}

	let tzArray = TimeZone.getTimeZoneArray();
	console.log(typeof tzArray);
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
			<form on:submit|preventDefault={savePersonel}>
				<Container class="mt-3">
					<div class="w-100 text-center fs-3">{user.email}</div>
					<Row cols="1" class="mt-3">
						<Col>
							<InputGroup class="mb-1">
								<InputGroupText>Your avatar url</InputGroupText>
								<input
									class="form-control"
									type="text"
									placeholder="URL of profile picture"
									bind:value={user.avatar}
									on:input={() => {
										onInputChange();
									}}
								/>
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
									on:input={() => {
										onInputChange();
									}}
								/>
							</InputGroup>
						</Col>
						<Col>
							<InputGroup class="mb-1">
								<InputGroupText>Your password:</InputGroupText>
								<input
									class="form-control"
									type="password"
									placeholder="New Password"
									bind:value={user.password}
									on:input={() => {
										onInputChange();
									}}
								/>
							</InputGroup>
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
						<InputGroup class="mb-1">
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
					<Col class="p-3">My Group: {user.group}</Col>
				</Row>
			</Container>
		</TabPane>
		<TabPane
			tabId="delegation"
			tab="Delegation"
			active={whichTab && whichTab['setting'] === 'delegation'}
		>
			<Container class="mt-3">
				<div class="w-100 text-center fs-3">Delegation</div>
				<Card class="mt-3">
					<CardHeader><CardTitle>Delegate my works to</CardTitle></CardHeader>
					<CardBody>
						<InputGroup class="mb-1">
							<InputGroupText>Between</InputGroupText>
							<Input
								type="date"
								bind:value={new_delegation_begindate}
								placeholder="Confirm with your password"
							/>
							<InputGroupText>and</InputGroupText>
							<Input
								type="date"
								bind:value={new_delegation_enddate}
								placeholder="Confirm with your password"
							/>
						</InputGroup>
						<InputGroup class="mb-1">
							<InputGroupText>to</InputGroupText>
							<Input bind:value={new_delegation_delegatee} placeholder="Delegtee's email" />
							<Button
								on:click={(e) => {
									e.preventDefault();
									newDelegation();
								}}
							>
								Delegate
							</Button>
						</InputGroup>
					</CardBody>
				</Card>

				<Card class="mt-3">
					<CardHeader><CardTitle>Delegations to me</CardTitle></CardHeader>
					<CardBody>
						<table hover class="w-100">
							<thead>
								<tr>
									<th> Begin </th>
									<th> Before </th>
									<th> Delegate to </th>
									<th> &nbsp; </th>
								</tr>
							</thead>
							<tbody>
								{#each delegationFromMe as row, index (row)}
									<tr
										class:kfk-odd={index % 2 !== 0}
										class:kfk-even={index % 2 === 0}
										class:tnt-odd={index % 2 !== 0}
										class:tnt-even={index % 2 === 0}
									>
										<td data-label="Begin Date">
											{moment(row.begindate).format('LL')}
										</td>
										<td data-label="Before Date">
											{moment(row.enddate).format('LL')}
										</td>
										<td data-label="Delegatee">
											{row.delegatee}
										</td>
										<td data-label="Delegatee">
											<Input type="checkbox" bind:checked={row.checked} />
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</CardBody>
					<CardFooter>
						<div class="w-100 text-right">
							<Button
								on:click={(e) => {
									e.preventDefault();
									removeSelectedDelegation();
								}}>Remove selected</Button
							>
						</div>
					</CardFooter>
				</Card>
			</Container>
		</TabPane>
		<TabPane tabId="org" tab="Org" active={whichTab && whichTab['setting'] === 'org'}>
			<Container class="mt-3 mb-3">
				<div class="w-100 text-center fs-3">{orgname}</div>
				<div class="w-100 text-center fs-6">
					Administrator: {myorg.owner === user.email ? 'Me' : myorg.owner}
				</div>
				<div class="w-100 text-center fs-6">
					My Role: {user.group}
				</div>
				{#if myorg.adminorg}
					<Card class="mt-3">
						<CardHeader><CardTitle>My Orgnization</CardTitle></CardHeader>
						<CardBody>
							<InputGroup class="mb-1">
								<InputGroupText>Admin Password:</InputGroupText>
								<Input
									type="password"
									bind:value={password_for_admin}
									placeholder="Confirm with your password"
								/>
							</InputGroup>
							<InputGroup class="mb-1">
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
							<InputGroup class="mb-1">
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
							<InputGroup class="mb-1">
								<InputGroupText>Set Timezone to:</InputGroupText>
								<Input type="select" bind:value={orgtimezone}>
									{#each tzArray as tz, index (tz)}
										<option value={tz.key}>{tz.name} ({tz.diff})</option>
									{/each}
								</Input>
								<Button
									on:click={(e) => {
										e.preventDefault();
										setMyTenantTimezone();
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
							<CardSubtitle>The name:</CardSubtitle>
							<CardText>
								{orgname}
							</CardText>
							<CardSubtitle>Timezone:</CardSubtitle>
							<CardText>
								{orgtimezone}
								{TimeZone.getDiff(orgtimezone)}
							</CardText>
						</CardBody>
					</Card>
				{/if}
				{#if myorg.adminorg}
					<Card class="mt-5">
						<CardHeader><CardTitle>Joincode</CardTitle></CardHeader>
						<CardBody>
							<div class="w-100 d-flex align-content-center">Current code: {myorg.joincode}</div>
							<InputGroup class="mb-1">
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
							<InputGroup class="mb-1">
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
							<InputGroup class="mb-1">
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
								<InputGroup class="mb-1">
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
			</Container>
		</TabPane>
		<TabPane tabId="members" tab="Members" active={whichTab && whichTab['setting'] === 'members'}>
			<Container class="mt-3">
				{#if myorg.adminorg === false}
					{#if myorg.owner === user.email}
						<div class="w-100 text-center fs-3">
							This is a PRIVTATE orgnization, the only member is youself.
						</div>
					{:else}
						<div class="w-100 text-center fs-3">
							This is an orgnization, member list is available
						</div>
					{/if}
				{:else if orgMembers && orgMembers.members && orgMembers.members.length > 0}
					<div class="w-100 text-center fs-3">Members</div>
					<Col>
						<table class="w-100 mt-3">
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
						<InputGroup class="mb-1">
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
						<InputGroup class="mb-1">
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
				{/if}
			</Container>
		</TabPane>
	</TabContent>
</Container>
{#if dev}
	<Container class="w-50 mt-5">
		<code><pre>
{JSON.stringify(user, null, 2)}
</pre></code>
	</Container>
{/if}
<Fade isOpen={fade_message != ''} class="kfk-fade">
	<Card body>
		{fade_message}
	</Card>
</Fade>

<style>
	.text-right {
		text-align: right;
	}
</style>
