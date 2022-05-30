<script type="ts">
	import {
		Button,
		Container,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Label,
		Input,
		Card,
		CardBody,
		CardFooter,
		CardHeader,
		CardSubtitle,
		CardText,
		CardTitle,
	} from 'sveltestrap';
	import TimeZone from '$lib/Timezone';
	import TimeTool from '$lib/TimeTool';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { setFadeMessage } from '$lib/Notifier';
	import { onMount } from 'svelte';
	import { _ } from '$lib/i18n';
	import type { User, EmpResponse } from '$lib/types';
	import { post } from '$lib/utils';
	import * as api from '$lib/api';

	let user: User = $session.user;
	let myorg: any = {
		orgname: '',
		orgtheme: '',
		orgtimezone: '',
		orgleveltags: '',
		owner: '',
	};

	let orgname = '';
	let orgtheme = '';
	let orgtimezone = '';
	let orgleveltags = '';
	let orgchartadminpds = '';

	let generatedJoinCode = '';
	let userDefinedJoinCode = '';
	let in_progress: boolean;

	let password_for_admin = '';
	let set_group_to = '';
	let set_password_to = '';
	let tzArray = TimeZone.getTimeZoneArray();
	let invitation: string;

	async function refreshMyOrg() {
		myorg = await api.post('tnt/my/org', {}, user.sessionToken);
		console.log(myorg);
		orgname = myorg.orgname;
		orgtheme = myorg.css;
		orgtimezone = myorg.timezone;
		orgleveltags = myorg.tags;
		orgchartadminpds = myorg.orgchartadminpds;
		if (myorg && myorg.joinapps && Array.isArray(myorg.joinapps)) {
			for (let i = 0; i < myorg.joinapps.length; i++) {
				myorg.joinapps[i].checked = true;
			}
		}
	}
	let orgchartrelationtest_conf = {
		show: { leader: true, query: true },
		useThisQuery: null,
		useThisLeader: null,
		lstr: '',
		qstr: '',
	};

	async function setMyTenantName() {
		in_progress = true;

		let ret = await api.post(
			'tnt/set/name',
			{ orgname: orgname, password: password_for_admin },
			user.sessionToken,
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
			user.sessionToken,
		);
		if (ret.error) {
			setFadeMessage(ret.message, 'warning');
		} else {
			//eslint-disable-next-line
			if (ret.css) {
				setFadeMessage('Orgniazation theme is set succesfully', 'success');
				const response = (await post(`/auth/refresh`, {})) as unknown as EmpResponse;

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
			user.sessionToken,
		);
		if (ret.error) {
			setFadeMessage(ret.message, 'warning');
		} else {
			//eslint-disable-next-line
			if (ret.timezone) {
				setFadeMessage('Orgniazation timezone is set succesfully', 'success');
				const response = (await post(`/auth/refresh`, {})) as unknown as EmpResponse;

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
			user.sessionToken,
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

	async function generateJoinCode() {
		let res = await api.post(
			'tnt/joincode/new',
			{ password: password_for_admin },
			user.sessionToken,
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
			user.sessionToken,
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
			user.sessionToken,
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

	async function sendInvitation() {
		let emails = invitation.split(/[ ;,]/).filter((x) => x.length > 0);
		let res = await api.post(
			'tnt/send/invitation',
			{ ems: emails.join(':'), password: password_for_admin },
			user.sessionToken,
		);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
			/* } else { */
			/*   refreshMembers(); */
		}
	}

	onMount(async () => {
		try {
			await refreshMyOrg();
		} catch (e) {}
	});
</script>

<form>
	<Container class="mt-3 mb-3">
		<Row>
			<nav aria-label="breadcrumb">
				<ol class="breadcrumb">
					<li class="breadcrumb-item kfk-tag">
						<a
							class="kfk-link"
							href={'#'}
							on:click={() => {
								goto('/settings');
							}}>
							{$_('navmenu.settings')}
						</a>
					</li>
					<li class="breadcrumb-item active" aria-current="page">{$_('setting.tenant.nav')}</li>
					<li class="breadcrumb-item active kfk-tag" aria-current="page">
						<a
							class="kfk-link"
							href={'#'}
							on:click={() => {
								goto('/settings/orgchart');
							}}>
							{$_('setting.orgchart.nav')}
						</a>
					</li>
					<li class="breadcrumb-item active kfk-tag" aria-current="page">
						<a
							class="kfk-link"
							href={'#'}
							on:click={() => {
								goto('/settings/members');
							}}>
							{$_('setting.members.nav')}
						</a>
					</li>
					<li class="breadcrumb-item active kfk-tag" aria-current="page">
						<a
							class="kfk-link"
							href={'#'}
							on:click={() => {
								goto('/settings/resign');
							}}>
							{$_('setting.resign.nav')}
						</a>
					</li>
				</ol>
			</nav>
		</Row>
		<div class="w-100 text-center fs-3">{orgname}</div>
		<div class="w-100 text-center fs-6">
			{$_('setting.tenant.administrator')}: {myorg.owner === user.email ? 'Me' : myorg.owner}
		</div>
		<div class="w-100 text-center fs-6">
			{$_('setting.tenant.myrole')}: {user.group}
		</div>
		{#if user.group === 'ADMIN'}
			<form>
				<Card class="mt-3">
					<CardHeader><CardTitle>{$_('setting.tenant.myorg')}</CardTitle></CardHeader>
					<CardBody>
						<InputGroup class="mb-1">
							<InputGroupText>{$_('setting.tenant.adminpwd')}</InputGroupText>
							<Input
								type="password"
								autocomplete="current-password"
								bind:value={password_for_admin}
								placeholder={$_('setting.tenant.adminpwd_ph')} />
						</InputGroup>
						<InputGroup class="mb-1">
							<InputGroupText>{$_('setting.tenant.name')}</InputGroupText>
							<Input bind:value={orgname} placeholder={$_('setting.tenant.name_ph')} />
							<Button
								on:click={(e) => {
									e.preventDefault();
									setMyTenantName();
								}}>
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
								}}>
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
								}}>
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
								}}>
								Set
							</Button>
						</InputGroup>
						<InputGroup>
							<InputGroupText>{$_('setting.tenant.ocadmins')}</InputGroupText>
							<Input
								type="text"
								bind:value={orgchartadminpds}
								placeholder={$_('setting.tenant.ocadmins_ph')} />
							<Button
								on:click={async (e) => {
									e.preventDefault();
									in_progress = true;

									let ret = await api.post(
										'tnt/set/orgchartadminpds',
										{ orgchartadminpds, password: password_for_admin },
										user.sessionToken,
									);
									if (ret.error) {
										setFadeMessage(ret.message, 'warning');
									} else {
										setFadeMessage('Success', 'success');
										myorg.orgchartadminpds = ret.orgchartadminpds;
										orgchartadminpds = ret.orgchartadminpds;
									}

									in_progress = false;
								}}>
								Set
							</Button>
						</InputGroup>
						<InputGroup>
							<InputGroupText>{$_('setting.tenant.regfree')}</InputGroupText>
							<Input class="ms-3" type="checkbox" bind:checked={myorg.regfree} />
							<div class="form-control border-0">
								<Label>
									{$_(`setting.tenant.set_regfree_${myorg.regfree}`)}
								</Label>
							</div>
							<Button
								on:click={async (e) => {
									e.preventDefault();

									let ret = await api.post(
										'tnt/set/regfree',
										{ regfree: myorg.regfree, password: password_for_admin },
										user.sessionToken,
									);
									if (ret.error) {
										setFadeMessage(ret.message, 'warning');
									} else {
										if (myorg.regfree) {
											setFadeMessage($_('setting.tenant.regfree_true'));
										} else {
											setFadeMessage($_('setting.tenant.regfree_false'));
										}
										myorg.regfree = ret.regfree;
									}
								}}>
								Set
							</Button>
						</InputGroup>
					</CardBody>
				</Card>
			</form>
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
					<CardText>{$_('setting.tenant.messagefornoadmin')}</CardText>
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
							}}>
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
							}}>
							Use it
						</Button>
					</InputGroup>
				</CardBody>
			</Card>
			<Card class="mt-3">
				<CardHeader>
					<CardTitle>{$_('setting.tenant.invite')}</CardTitle>
				</CardHeader>
				<CardBody>
					<InputGroup class="mb-1">
						<Input
							type="textarea"
							bind:value={invitation}
							placeholder={$_('setting.tenant.invite_ph')} />
						<Button
							on:click={(e) => {
								e.preventDefault();
								sendInvitation();
							}}>
							Invite
						</Button>
					</InputGroup>
				</CardBody>
			</Card>
			<Card class="mt-3">
				<CardHeader>
					<CardTitle>{$_('setting.tenant.joinapplication')}</CardTitle>
				</CardHeader>
				<CardBody>
					<Button
						color="secondary"
						on:click={(e) => {
							e.preventDefault();
							refreshMyOrg();
						}}>
						Refresh
					</Button>
					{#if myorg.joinapps && Array.isArray(myorg.joinapps) && myorg.joinapps.length > 0}
						<table class="w-100">
							<thead>
								<tr>
									<th>Email</th>
									<th>Name</th>
									<th>Approve</th>
								</tr>
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
								placeholder="Confirm with org password" />
							<Button
								on:click={(e) => {
									e.preventDefault();
									approveJoinOrgApplications();
								}}>
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
</form>
