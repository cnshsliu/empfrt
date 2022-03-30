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
	import { _ } from '$lib/i18n';
	import { session } from '$app/stores';
	import { dev } from '$app/env';
	import { filterStorage } from '$lib/empstores';
	import { get } from 'svelte/store';
	import { getNotificationsContext } from 'svelte-notifications';
	const { addNotification } = getNotificationsContext();
	import type { EmpResponse, OrgMembers, oneArgFunc } from '$lib/types';
	import SmtpAdmin from './smtpadmin.svelte';
	import Personal from './personal.svelte';
	import WeComBot from './wecombot.svelte';
	import OrgChart from './orgchart.svelte';
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
	let set_password_to = '';
	let in_progress: boolean;
	let orgname = myorg.orgname;
	let orgtheme = myorg.css;
	let orgtimezone = myorg.timezone;
	let orgleveltags = myorg.tags;
	let orgchartadminpds = myorg.orgchartadminpds;

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
			if (ret.timezone) {
				setFadeMessage('Orgniazation timezone is set succesfully', 'success');
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
	}

	async function showTab(tabId: string, firstLevel = true) {
		if (firstLevel) {
			$filterStorage.settingTab = tabId;
			if (tabId === 'org') {
				//refreshMyOrg();
			} else if (tabId === 'members') {
				refreshMembers();
			}
		} else {
			$filterStorage.settingTab2nd = tabId;
		}
	}

	onMount(async () => {
		await refreshMyOrg();
	});
	const isActive = function (tabname, firstLevel = true) {
		if (firstLevel) {
			let tabs = $filterStorage.settingTab;
			if (!tabs) {
				tabs = 'personal';
				$filterStorage.settingTab = 'personal';
			}
			return tabs.indexOf(tabname) > -1;
		} else {
			let tabs = $filterStorage.settingTab2nd;
			if (!tabs) {
				tabs = 'personal';
				$filterStorage.settingTab = 'personal';
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
			refreshMembers();
		}
	}
	async function setSelectedPassword() {
		let ems = orgMembers.members
			.filter((x) => x.email !== user.email)
			.filter((x) => x.checked)
			.map((x) => x.email)
			.join(':');
		let res = await api.post(
			'tnt/member/setpassword',
			{ ems, password: password_for_admin, set_password_to: set_password_to },
			user.sessionToken
		);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
		} else {
			setFadeMessage('Set password successfully', 'success');
		}
	}

	let invitation: string;

	async function sendInvitation() {
		let emails = invitation.split(/[ ;,]/).filter((x) => x.length > 0);
		let res = await api.post(
			'tnt/send/invitation',
			{ ems: emails.join(':'), password: password_for_admin },
			user.sessionToken
		);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
		} else {
			refreshMembers();
		}
	}

	let new_delegation_enddate: string,
		new_delegation_begindate: string,
		new_delegation_delegatee: string;

	async function newDelegation() {
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

	let authorizedAdmin = false;
	api.post('orgchart/authorized/admin', {}, user.sessionToken).then((res) => {
		authorizedAdmin = res as unknown as boolean;
	});
</script>

<svelte:head>
	<title>Settings • HyperFlow</title>
</svelte:head>
<Container class="mt-3">
	<TabContent
		on:tab={(e) => {
			showTab('' + e.detail);
		}}
	>
		<TabPane tabId="personal" tab={$_('setting.tab.personal')} active={isActive('personal')}>
			<Personal {user} {setFadeMessage} />
		</TabPane>
		<TabPane tabId="wecombot" tab={$_('setting.tab.wecombot')} active={isActive('wecombot')}>
			<WeComBot {user} {setFadeMessage} />
		</TabPane>
		<TabPane tabId="delegation" tab={$_('setting.tab.delegation')} active={isActive('delegation')}>
			<Container class="mt-3">
				<div class="w-100 text-center fs-3">{$_('setting.delegation.delegation')}</div>
				<Card class="mt-3">
					<CardHeader><CardTitle>{$_('setting.delegation.delegateto')}</CardTitle></CardHeader>
					<CardBody>
						<InputGroup class="mb-1">
							<InputGroupText>{$_('setting.delegation.BeginDate')}</InputGroupText>
							<Input type="date" bind:value={new_delegation_begindate} />
							<InputGroupText>{$_('setting.delegation.EndDate')}</InputGroupText>
							<Input type="date" bind:value={new_delegation_enddate} />
						</InputGroup>
						<InputGroup class="mb-1">
							<InputGroupText>{$_('setting.delegation.towhom')}</InputGroupText>
							<Input bind:value={new_delegation_delegatee} placeholder="Delegtee's email" />
							<Button
								on:click={(e) => {
									e.preventDefault();
									newDelegation();
								}}
							>
								{$_('setting.delegation.Delegate')}
							</Button>
						</InputGroup>
					</CardBody>
				</Card>

				<Card class="mt-3">
					<CardHeader><CardTitle>{$_('setting.delegation.tome')}</CardTitle></CardHeader>
					<CardBody>
						<table class="w-100">
							<thead>
								<tr>
									<th> {$_('setting.delegation.BeginDate')} </th>
									<th> {$_('setting.delegation.EndDate')} </th>
									<th> {$_('setting.delegation.Delegatee')} </th>
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
								}}
							>
								{$_('setting.delegation.removeSelected')}
							</Button>
						</div>
					</CardFooter>
				</Card>
			</Container>
		</TabPane>
		<TabPane tabId="orgset" tab={$_('setting.tab.orgset')} active={isActive('orgset')}>
			<Container class="mt-3 mb-3">
				<div class="w-100 text-center fs-3">{orgname}</div>
				<div class="w-100 text-center fs-6">
					{$_('setting.tenant.administrator')}: {myorg.owner === user.email ? 'Me' : myorg.owner}
				</div>
				<div class="w-100 text-center fs-6">
					{$_('setting.tenant.myrole')}: {user.group}
				</div>
				{#if user.group === 'ADMIN'}
					<Card class="mt-3">
						<CardHeader><CardTitle>{$_('setting.tenant.myorg')}</CardTitle></CardHeader>
						<CardBody>
							<InputGroup class="mb-1">
								<InputGroupText>{$_('setting.tenant.adminpwd')}</InputGroupText>
								<Input
									type="password"
									bind:value={password_for_admin}
									placeholder={$_('setting.tenant.adminpwd_ph')}
								/>
							</InputGroup>
							<InputGroup class="mb-1">
								<InputGroupText>{$_('setting.tenant.name')}</InputGroupText>
								<Input bind:value={orgname} placeholder={$_('setting.tenant.name_ph')} />
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
								<InputGroupText>{$_('setting.tenant.theme')}</InputGroupText>
								<Input bind:value={orgtheme} placeholder={$_('setting.tenant.theme_ph')} />
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
								<InputGroupText>{$_('setting.tenant.timezone')}</InputGroupText>
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
								<InputGroupText>{$_('setting.tenant.orgtags')}</InputGroupText>
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
							<InputGroup class="mb-1">
								<InputGroupText>{$_('setting.tenant.ocadmins')}</InputGroupText>
								<Input
									type="text"
									bind:value={orgchartadminpds}
									placeholder={$_('setting.tenant.ocadmins_ph')}
								/>
								<Button
									on:click={async (e) => {
										e.preventDefault();
										in_progress = true;

										let ret = await api.post(
											'tnt/set/orgchartadminpds',
											{ orgchartadminpds, password: password_for_admin },
											user.sessionToken
										);
										if (ret.error) {
											setFadeMessage(ret.message, 'warning');
										} else {
											setFadeMessage('Success', 'success');
											myorg.orgchartadminpds = ret.orgchartadminpds;
											orgchartadminpds = ret.orgchartadminpds;
										}

										in_progress = false;
									}}
								>
									Set
								</Button>
							</InputGroup>
						</CardBody>
					</Card>
				{:else}
					<Card class="mt-3">
						<CardHeader><CardTitle>{$_('setting.tenant.myorg')}</CardTitle></CardHeader>
						<CardBody>
							<CardSubtitle>{$_('setting.tenant.myorgname')}</CardSubtitle>
							<CardText>
								{orgname}
							</CardText>
							<CardSubtitle>{$_('setting.tenant.myorgtimezone')}</CardSubtitle>
							<CardText>
								{orgtimezone}
								{TimeZone.getDiff(orgtimezone)}
							</CardText>
						</CardBody>
					</Card>
				{/if}
				{#if myorg.adminorg}
					<Card class="mt-5">
						<CardHeader><CardTitle>{$_('setting.tenant.joincode')}</CardTitle></CardHeader>
						<CardBody>
							<div class="w-100 d-flex align-content-center">
								{$_('setting.tenant.currentcode')}: {myorg.joincode}
							</div>
							<InputGroup class="mb-1">
								<InputGroupText>{$_('setting.tenant.genjoincode')}</InputGroupText>
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
								<InputGroupText>{$_('setting.tenant.selfjoincode')}</InputGroupText>
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
							<CardTitle>{$_('setting.tenant.invite')}</CardTitle></CardHeader
						>
						<CardBody>
							<InputGroup class="mb-1">
								<Input
									type="textarea"
									bind:value={invitation}
									placeholder={$_('setting.tenant.invite_ph')}
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
							<CardTitle>{$_('setting.tenant.joinapplication')}</CardTitle></CardHeader
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
								{$_('setting.tenant.noapplication')}
							{/if}
						</CardBody>
					</Card>
				{/if}
			</Container>
		</TabPane>
		<TabPane tabId="orgchart" tab={$_('setting.tab.orgchart')} active={isActive('orgchart')}>
			<Container class="mt-3 mb-3 w-100">
				<div class="overflow-scroll w-100 bg-light">
					<OrgChart {user} {setFadeMessage} {authorizedAdmin} showOuId={true} />
				</div>
			</Container>
		</TabPane>
		<TabPane tabId="members" tab={$_('setting.tab.members')} active={isActive('members')}>
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
					<div class="w-100 text-center fs-3">{$_('setting.members.members')}</div>
					<Col>
						<table class="w-100 mt-3">
							<thead>
								<tr>
									<th> {$_('setting.members.email')} </th> <th> {$_('setting.members.name')} </th>
									<th>
										{$_('setting.members.group')}
									</th>
									<th> {orgMembers.adminorg ? $_('setting.members.select') : ''} </th>
								</tr>
							</thead>
							<tbody>
								{#each orgMembers.members as member, index (member)}
									<tr
										class:kfk-odd={index % 2 !== 0}
										class:kfk-even={index % 2 === 0}
										class:tnt-odd={index % 2 !== 0}
										class:tnt-even={index % 2 === 0}
									>
										<td data-label="Email">
											{member.email}
										</td>
										<td data-label="Name">
											{member.username}
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
							<InputGroupText>{$_('setting.adminpwd')}</InputGroupText>
							<Input
								type="password"
								bind:value={password_for_admin}
								placeholder={$_('setting.adminpwd_ph')}
							/>
						</InputGroup>
					</Col>
					<Col class="d-flex justify-content-end mt-2">
						<InputGroup class="mb-1">
							<InputGroupText>{$_('setting.members.removeselected')}?</InputGroupText>
							<Button
								on:click={(e) => {
									e.preventDefault();
									removeSelectedMembers();
								}}
							>
								{$_('setting.members.remove')}
							</Button>
						</InputGroup>
					</Col>
					<Col class="d-flex justify-content-end mt-2">
						<InputGroup class="mb-1">
							<Label for="groupSelect">{$_('setting.members.setgroup')}</Label>
							<Input type="select" name="select" id="groupSelect" bind:value={set_group_to}>
								<option value="ADMIN">{$_('authgroup.ADMIN')}</option>
								<option value="OBSERVER">{$_('authgroup.OBSERVER')}</option>
								<option value="DOER">{$_('authgroup.DOER')}</option>
							</Input>
							<Button
								on:click={(e) => {
									e.preventDefault();
									setSelectedGroup();
								}}
							>
								{$_('setting.set')}
							</Button>
						</InputGroup>
					</Col>
					<Col class="d-flex justify-content-end mt-2">
						<InputGroup class="mb-1">
							<Label for="groupSelect">{$_('setting.members.setpwd')}</Label>
							<Input type="password" id="password_for_selected" bind:value={set_password_to} />
							<Button
								on:click={(e) => {
									e.preventDefault();
									setSelectedPassword();
								}}
							>
								{$_('setting.set')}
							</Button>
						</InputGroup>
					</Col>
				{/if}
			</Container>
		</TabPane>
		<TabPane tabId="smtp" tab={$_('setting.tab.smtp')} active={isActive('smtp')}>
			<SmtpAdmin {user} {myorg} {setFadeMessage} />
		</TabPane>
		<TabPane tabId="data" tab={$_('setting.tab.data')} active={isActive('data')}>
			<ul>
				<li><a href="/list">{$_('setting.data.list')}</a></li>
				<li><a href="/team">{$_('setting.data.team')}</a></li>
			</ul>
		</TabPane>
	</TabContent>
</Container>

<style>
	.text-right {
		text-align: right;
	}
</style>
