<script context="module" type="ts">
	export const ssr = false;
	import * as api from '$lib/api';
	import TimeZone from '$lib/Timezone';
	let TimeTool = null;
	export async function load({ session }) {
		const { user } = session;
		if (!user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}
		TimeTool = (await import('$lib/TimeTool')).default;

		let myorg = await api.post('tnt/my/org', {}, user.sessionToken);
		if (myorg && myorg.joinapps && Array.isArray(myorg.joinapps)) {
			for (let i = 0; i < myorg.joinapps.length; i++) {
				myorg.joinapps[i].checked = true;
			}
		}
		console.log(JSON.stringify(myorg));

		let delegationFromMe: any[] = [];
		try {
			delegationFromMe = (await post('/delegation/fromme')) as unknown as any[];
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
	import { API_SERVER } from '$lib/Env';
	import { session } from '$app/stores';
	import { dev } from '$app/env';
	import { filterStore } from '$lib/empstores';
	import { get } from 'svelte/store';
	import { getNotificationsContext } from 'svelte-notifications';
	const { addNotification } = getNotificationsContext();
	import type { EmpResponse, OrgMembers, oneArgFunc } from '$lib/types';
	import SmtpAdmin from './smtpadmin.svelte';
	import Personal from './personal.svelte';
	import OrgChartCsvFormat from './orgchartcsvformat.svelte';
	import OrgChart from './orgchart.svelte';
	import OrgChartRelationTest from '$lib/orgchartrelationtest.svelte';
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
		InputGroup,
		InputGroupText,
		Input,
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
	export let myorg: any;
	export let delegationFromMe: any;
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	let menu = '';
	let password_for_admin = '';
	let set_group_to = '';
	let in_progress: boolean;
	let orgname = myorg.orgname;
	let orgtheme = myorg.css;
	let orgtimezone = myorg.timezone;
	let orgleveltags = myorg.tags;

	let orgchartrelationtest_conf = {
		show: { leader: true, query: true },
		useThisQuery: null,
		useThisLeader: null,
		lstr: '',
		qstr: ''
	};

	export function setFadeMessage(
		message: string,
		type = 'warning',
		pos = 'bottom-right',
		time = 2000
	) {
		(addNotification as oneArgFunc)({
			text: message,
			position: pos,
			type: type,
			removeAfter: time
		});
	}

	async function savePersonel() {
		in_progress = true;

		let payload = {
			email: user.email,
			avatar: user.avatar,
			username: user.username,
			password: user.password,
			ew: user.ew,
			old_password: my_old_password
		};
		console.log(payload);
		const response = (await post('auth/save', payload)) as unknown as EmpResponse;
		if (response.error) {
			setFadeMessage(response.message);
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
	}

	async function setMyTenantName() {
		in_progress = true;

		let ret = await api.post(
			'tnt/set/name',
			{ orgname: orgname, password: password_for_admin },
			user.sessionToken
		);
		if (ret.error) {
			setFadeMessage(ret.message, 'warning');
		} else {
			//eslint-disable-next-line
			if (ret.orgname) {
				setFadeMessage('Orgniazation name is set succesfully', 'success');
				$session.user.tenant.name = ret.orgname;
			} else {
				setFadeMessage('Error', 'warning');
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
			setFadeMessage(ret.message, 'warning');
		} else {
			//eslint-disable-next-line
			if (ret.css) {
				setFadeMessage('Orgniazation theme is set succesfully', 'success');
				const response = (await post(`auth/refresh`, {})) as unknown as EmpResponse;

				if (response.user) {
					$session.user = response.user;
				}
			} else {
				setFadeMessage('Error', 'warning');
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
			setFadeMessage(ret.message, 'warning');
		} else {
			//eslint-disable-next-line
			console.log(ret);
			if (ret.timezone) {
				setFadeMessage('Orgniazation timezone is set succesfully', 'success');
				const response = (await post(`auth/refresh`, {})) as unknown as EmpResponse;

				if (response.user) {
					console.log('Refresh User after Tenant TimeZone');
					$session.user = response.user;
				}
			} else {
				setFadeMessage('Error', 'warning');
			}
		}

		in_progress = false;
	}

	async function setMyTenantOrgLevelTags() {
		in_progress = true;

		let ret = await api.post(
			'tnt/set/tags',
			{ tags: orgleveltags, password: password_for_admin },
			user.sessionToken
		);
		if (ret.error) {
			setFadeMessage(ret.message, 'warning');
		} else {
			setFadeMessage('Success', 'success');
			orgleveltags = ret.tags;
			myorg.tags = ret.tags;
		}

		in_progress = false;
	}

	let generatedJoinCode = '';
	let userDefinedJoinCode = '';

	async function generateJoinCode() {
		let res = await api.post(
			'tnt/joincode/new',
			{ password: password_for_admin },
			user.sessionToken
		);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
		} else if (res.joincode) {
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
			setFadeMessage(res.message, 'warning');
		} else if (res.joincode) {
			generatedJoinCode = res.joincode;
			myorg.joincode = generatedJoinCode;
		}
	}

	async function approveJoinOrgApplications() {
		let ems = myorg.joinapps
			.filter((x: any) => x.checked)
			.map((x: any) => x.user_email)
			.join(':');
		let res = await api.post(
			'tnt/approve',
			{ ems, password: password_for_admin },
			user.sessionToken
		);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
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
		orgname = myorg.orgname;
		orgtheme = myorg.css;
		orgtimezone = myorg.timezone;
		if (myorg && myorg.joinapps && Array.isArray(myorg.joinapps)) {
			for (let i = 0; i < myorg.joinapps.length; i++) {
				myorg.joinapps[i].checked = true;
			}
		}
	}

	let orgMembers: OrgMembers;
	async function refreshMembers() {
		orgMembers = (await api.post('tnt/members', {}, user.sessionToken)) as unknown as OrgMembers;
		if (orgMembers && orgMembers.members && orgMembers.members.length > 0) {
			orgMembers.members = orgMembers.members.filter((x) => x.email !== user.email);
			orgMembers.members.unshift({
				email: user.email,
				username: user.username,
				group: user.group,
				checked: false
			});
			for (let i = 0; i < orgMembers.members.length; i++) {
				orgMembers.members[i].checked = false;
			}
		}
		console.log(orgMembers.members);
	}

	async function showTab(tabId: string, firstLevel = true) {
		if (firstLevel) {
			$filterStore.settingTab = tabId;
			if (tabId === 'org') {
				//refreshMyOrg();
			} else if (tabId === 'members') {
				refreshMembers();
			}
		} else {
			$filterStore.settingTab2nd = tabId;
		}
	}

	onMount(async () => {
		await refreshMyOrg();
	});
	const isActive = function (tabname, firstLevel = true) {
		if (firstLevel) {
			let tabs = $filterStore.settingTab;
			if (!tabs) {
				tabs = 'personal';
				$filterStore.settingTab = 'personal';
			}
			return tabs.indexOf(tabname) > -1;
		} else {
			let tabs = $filterStore.settingTab2nd;
			if (!tabs) {
				tabs = 'personal';
				$filterStore.settingTab = 'personal';
			}
			return tabs.indexOf(tabname) > -1;
		}
	};

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
			setFadeMessage(res.message, 'warning');
		} else {
			console.log('removeSelectedMembers refreshMembers');
			refreshMembers();
		}
	}

	async function removeSelectedDelegation() {
		let ids = delegationFromMe
			.filter((x: any) => x.checked)
			.map((x: any) => x._id)
			.join(':');
		let res = await api.post('undelegate', { ids: ids }, user.sessionToken);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
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
			setFadeMessage(res.message, 'warning');
		} else {
			console.log('setSelectedGroup refreshMembers');
			refreshMembers();
		}
	}

	let invitation: string;

	async function sendInvitation() {
		let emails = invitation.split(/[ ;,]/).filter((x) => x.length > 0);
		console.log(emails);
		let res = await api.post(
			'tnt/send/invitation',
			{ ems: emails.join(':'), password: password_for_admin },
			user.sessionToken
		);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
		} else {
			console.log('show Invitation refreshMembers');
			refreshMembers();
		}
	}

	let new_delegation_enddate: string,
		new_delegation_begindate: string,
		new_delegation_delegatee: string;

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
			setFadeMessage(ret.message, 'warning');
		} else if (ret.length) {
			delegationFromMe = ret;
			for (let i = 0; i < delegationFromMe.length; i++) {
				delegationFromMe[i].checked = false;
			}
		}
	}

	let tzArray = TimeZone.getTimeZoneArray();
	console.log(typeof tzArray);

	let files: any;
	let orgchart_admin_password = '';
	let default_user_password = '';
	async function uploadOrgChart(e: Event) {
		e.preventDefault();
		const formData = new FormData();
		formData.append('password', orgchart_admin_password);
		formData.append('default_user_password', default_user_password);
		formData.append('file', files[0]);
		await fetch(`${API_SERVER}/orgchart/import`, {
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
					setFadeMessage('Sucess', 'success');
				}
			})
			.catch((error) => {
				console.error('Error:', error);
				setFadeMessage(error.message, 'warning');
			});
	}
</script>

<svelte:head>
	<title>Settings • HyperFlow</title>
</svelte:head>
<Container class="mt-3">
	<div class="spinner">&nbsp;</div>
	<TabContent
		on:tab={(e) => {
			showTab('' + e.detail);
		}}
	>
		<TabPane tabId="personal" tab="Personal" active={isActive('personal')}>
			<Personal {user} {setFadeMessage} />
		</TabPane>
		<TabPane tabId="delegation" tab="Delegation" active={isActive('delegation')}>
			<Container class="mt-3">
				<div class="w-100 text-center fs-3">Delegation</div>
				<Card class="mt-3">
					<CardHeader><CardTitle>Delegate my works to</CardTitle></CardHeader>
					<CardBody>
						<InputGroup class="mb-1">
							<InputGroupText>Between</InputGroupText>
							<Input type="date" bind:value={new_delegation_begindate} />
							<InputGroupText>and</InputGroupText>
							<Input type="date" bind:value={new_delegation_enddate} />
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
						<table class="w-100">
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
											{TimeTool.format(row.begindate, 'LL')}
										</td>
										<td data-label="Before Date">
											{TimeTool.format(row.enddate, 'LL')}
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
		<TabPane tabId="orgset" tab="Org" active={isActive('orgset')}>
			<Container class="mt-3 mb-3">
				<div class="w-100 text-center fs-3">{orgname}</div>
				<div class="w-100 text-center fs-6">
					Administrator: {myorg.owner === user.email ? 'Me' : myorg.owner}
				</div>
				<div class="w-100 text-center fs-6">
					My Role: {user.group}
				</div>
				{#if user.group === 'ADMIN'}
					<Card class="mt-3">
						<CardHeader><CardTitle>My Orgnization</CardTitle></CardHeader>
						<CardBody>
							<InputGroup class="mb-1">
								<InputGroupText>Admin Password:</InputGroupText>
								<Input
									type="password"
									bind:value={password_for_admin}
									placeholder="Confirm with admin password"
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
									{#each tzArray as tz}
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
							<InputGroup class="mb-1">
								<InputGroupText>Org level tags:</InputGroupText>
								<Input type="text" bind:value={orgleveltags} />
								<Button
									on:click={(e) => {
										e.preventDefault();
										setMyTenantOrgLevelTags();
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
									on:click={() => {
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
										{#each myorg.joinapps as appl}
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
										placeholder="Confirm with org password"
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
								There is no join application at this time
							{/if}
						</CardBody>
					</Card>
				{/if}
			</Container>
		</TabPane>
		<TabPane tabId="orgchart" tab="Orgchart" active={isActive('orgchart')}>
			<Container class="mt-3 mb-3 w-100">
				<TabContent
					pills
					on:tab={(e) => {
						showTab(e.detail.toString(), false);
					}}
				>
					<TabPane tabId="zzorg" tab="Orgchart" active={isActive('zzorg', false)}>
						<div class="overflow-scroll w-100 bg-light">
							<OrgChart {user} showOuId={true} />
						</div>
					</TabPane>
					<TabPane
						tabId="zzorgimport"
						tab="Orgchart Import"
						active={isActive('orgchart/zzorgimport')}
					>
						<form class="new" enctype="multipart/form-data">
							<Row class="w-100">
								<Col class="w-100">
									<InputGroup>
										<InputGroupText>Default password for new staff</InputGroupText>
										<input
											name="default_user_password"
											type="password"
											bind:value={default_user_password}
										/>
									</InputGroup>
									<InputGroup>
										<InputGroupText>Orgchart CSV file</InputGroupText>
										<input name="file" type="file" bind:files />
									</InputGroup>
									<InputGroup>
										<InputGroupText>Administrator password</InputGroupText>
										<input
											name="orgchart_admin_password"
											type="password"
											bind:value={orgchart_admin_password}
										/>
										<Button size="sm" on:click={uploadOrgChart} color="primary">Import</Button>
									</InputGroup>
								</Col>
							</Row>
						</form>
					</TabPane>
					<TabPane
						tabId="zzorgtest"
						tab="Orgchart Relation Test"
						active={isActive('zzorgtest', false)}
					>
						<div class="overflow-scroll w-100 bg-light">
							<OrgChartRelationTest
								{user}
								bind:show={orgchartrelationtest_conf.show}
								bind:useThisQuery={orgchartrelationtest_conf.useThisQuery}
								bind:useThisLeader={orgchartrelationtest_conf.useThisLeader}
								bind:lstr={orgchartrelationtest_conf.lstr}
								bind:qstr={orgchartrelationtest_conf.qstr}
							/>
						</div>
					</TabPane>
					<TabPane
						tabId="fileformat"
						tab="Orgchart File Format"
						active={isActive('fileformat', false)}
					>
						<OrgChartCsvFormat />
					</TabPane>
				</TabContent>
			</Container>
		</TabPane>
		<TabPane tabId="members" tab="Members" active={isActive('members')}>
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
							<InputGroupText>Admin password</InputGroupText>
							<Input
								type="password"
								bind:value={password_for_admin}
								placeholder="Confirm with your password"
							/>
						</InputGroup>
					</Col>
					<Col class="d-flex justify-content-end mt-2">
						<InputGroup class="mb-1">
							<InputGroupText>Remove selected?</InputGroupText>
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
		<TabPane tabId="smtp" tab="SMTP" active={isActive('smtp')}>
			<SmtpAdmin {user} {myorg} {setFadeMessage} />
		</TabPane>
	</TabContent>
</Container>

<style>
	.text-right {
		text-align: right;
	}
</style>
