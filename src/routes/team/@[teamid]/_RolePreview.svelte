<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import * as api from '$lib/api';
	import type { User, Team, TmapEntry } from '$lib/types';
	import { Container, Row, Col, Icon } from 'sveltestrap';
	import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Badge } from 'sveltestrap';
	import { enhance, enhanceAddOneRoleMember } from '$lib/form';
	import type { Perm } from '$lib/types';
	import { ClientPermControl } from '$lib/clientperm';
	import Parser from '$lib/parser';
	export let team: Team;
	export let aRole: string;
	export let mouseover_objid: string;
	export let deleteRole: { (arg: string): void };
	export let refreshTeam: { (arg: Team): void };
	export let errmsg = '';

	export let form_id = '';
	export let user: User;

	function show_form(theRole: string, action: string): void {
		form_id = action + '_' + theRole;
	}
	function deleteMember(aTeam: Team, aRole: string, aMember: TmapEntry) {
		let payload = { teamid: aTeam.teamid, role: aRole, members: [aMember] };
		const token = user.sessionToken;
		setTimeout(async () => {
			//eslint-disable-next-line
			team = (await api.post('team/role/member/delete', payload, token)) as Team;
		}, 10);
	}

	let urls = {
		role_member_add: `${API_SERVER}/team/role/member/add`,
		role_copy: `${API_SERVER}/team/role/copy`
	};
</script>

<Container class={mouseover_objid === aRole ? 'kfk-highlight-2' : ''}>
	<Row>
		<Col xs="6">
			<div>
				<span class="preview-link kfk-team-id">
					{aRole}
				</span>
			</div>
		</Col>
		{#if ClientPermControl(user.perms, user.email, 'team', team, 'update')}
			<Col xs="4" class="d-flex justify-content-end">
				{#if mouseover_objid === aRole}
					<a class="btn btn-sm" href={'#'} on:click|preventDefault={() => show_form(aRole, 'add')}>
						<Icon name="person-plus-fill" /> Add
					</a>
					<a class="btn btn-sm" href={'#'} on:click|preventDefault={() => show_form(aRole, 'copy')}>
						<Icon name="files" />Copy
					</a>
				{/if}
			</Col>
			<Col xs="2">
				{#if mouseover_objid === aRole}
					<Dropdown class="kfk-role-action-icon">
						<DropdownToggle caret color="notexist" class="btn-sm">More</DropdownToggle>
						<DropdownMenu>
							<DropdownItem class="kfk-role-action-icon">
								<a href={'#'} on:click|preventDefault={() => deleteRole(aRole)} class="nav-link "
									><Icon name="trash" />
									Delete this role
								</a>
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				{/if}
			</Col>
		{/if}
	</Row>
	{#if ClientPermControl(user.perms, user.email, 'team', team, 'update')}
		<Row>
			<Col xs="12">
				{#if form_id === `add_${aRole}`}
					<form
						action={urls.role_member_add}
						method="post"
						use:enhanceAddOneRoleMember={{
							token: user.sessionToken,
							result: async (res, form) => {
								const retObj = await res.json();
								console.log('--------');
								console.log(JSON.stringify(retObj, null, 2));
								console.log('--------');
								if (retObj.error) {
									console.log(retObj.error);
									errmsg = retObj.errMsg;
								} else {
									team = retObj;
									form.reset();
									errmsg = '';
								}
							}
						}}
					>
						Email:
						<input name="uid" placeholder="Email" autocomplete="off" />
						Name:
						<input name="dname" placeholder="Name" autocomplete="off" />

						<input type="hidden" name="teamid" value={team.teamid} />
						<input type="hidden" name="role" value={aRole} />
						<Button color="primary" type="submit" size="sm">Add</Button>
						{#if errmsg !== ''}{errmsg}{/if}
					</form>
				{/if}
				{#if form_id === `copy_${aRole}`}
					<form
						action={urls.role_copy}
						method="post"
						use:enhance={{
							token: user.sessionToken,
							result: async (res, form) => {
								const retObj = await res.json();
								if (retObj.error) {
									console.log(retObj.error);
									errmsg = retObj.errMsg;
								} else {
									team = retObj;
									refreshTeam(team);
									form.reset();
									errmsg = '';
								}
							}
						}}
					>
						Copy to role:
						<input name="newrole" placeholder="Copy to role" autocomplete="off" />
						<input type="hidden" name="teamid" value={team.teamid} />
						<input type="hidden" name="role" value={aRole} />
						<Button color="primary" type="submit" size="sm">Copy</Button>
						{#if errmsg !== ''}{errmsg}{/if}
					</form>
				{/if}
			</Col>
		</Row>
	{/if}
	<Row>
		<Col xs="12">
			<div style="margin-bottom:10px;">
				{#if team.tmap[aRole]}
					{#each team.tmap[aRole] as aMember (aMember.uid)}
						<Badge pill color="info" class="kfk-role-member-tag">
							{aMember.dname} &lt;{aMember.uid}&gt;
							{#if ClientPermControl(user.perms, user.email, 'team', team, 'update')}
								<a
									href={'#'}
									on:click|preventDefault={() => {
										deleteMember(team, aRole, aMember);
									}}
								>
									<Icon name="x" />
								</a>
							{/if}
						</Badge>
					{/each}
				{/if}
			</div>
		</Col>
	</Row>
</Container>
