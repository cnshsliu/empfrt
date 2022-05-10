<script type="ts">
	import {
		Button,
		Container,
		Label,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Input
	} from 'sveltestrap';
	import TimeZone from '$lib/Timezone';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { setFadeMessage } from '$lib/Notifier';
	import type { User, EmpResponse, OrgMembers } from '$lib/types';
	import { onMount } from 'svelte';
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';

	let user: User = $session.user;
	let myorg: any = {
		owner: ''
	};

	let password_for_admin = '';
	let set_group_to = '';
	let set_password_to = '';

	async function refreshMyOrg() {
		myorg = await api.post('tnt/my/org', {}, user.sessionToken);
		console.log(myorg);
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

	onMount(async () => {
		try {
			await refreshMyOrg();
			await refreshMembers();
		} catch (e) {}
	});
</script>

<form>
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
					<li class="breadcrumb-item active" aria-current="page">
						<a
							href={'#'}
							on:click={() => {
								goto('/settings/tenant');
							}}
						>
							{$_('setting.tenant.nav')}
						</a>
					</li>
					<li class="breadcrumb-item active" aria-current="page">
						<a
							href={'#'}
							on:click={() => {
								goto('/settings/orgchart');
							}}
						>
							{$_('setting.orgchart.nav')}
						</a>
					</li>
					<li class="breadcrumb-item active" aria-current="page">
						{$_('setting.members.nav')}
					</li>
				</ol>
			</nav>
		</Row>
		{#if myorg.adminorg === false}
			{#if myorg.owner === user.email}
				<div class="w-100 text-center fs-3">
					This is a PRIVTATE orgnization, the only member is youself.
				</div>
			{:else}
				<div class="w-100 text-center fs-3">This is an orgnization, member list is available</div>
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
</form>
