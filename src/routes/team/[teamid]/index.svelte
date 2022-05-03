<script context="module" lang="ts">
	export async function load({ url, params, fetch, session }) {
		let teamid = params.teamid;
		if (teamid && teamid.charAt(0) === '@') teamid = teamid.substring(1);
		const jsonUrl = `/team/@${teamid}.json`;
		const res = await fetch(jsonUrl);

		return {
			props: {
				team: await res.json(),
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import type { User, Team } from '$lib/types';
	import { TabContent, TabPane } from 'sveltestrap';
	import RolePreview from './_RolePreview.svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { title } from '$lib/title';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import { Container, Row, Col, Nav, Icon, NavItem, NavLink } from 'sveltestrap';
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
	import { enhance } from '$lib/form';
	import { ClientPermControl } from '$lib/clientperm';
	export let team: Team;
	export let mouseover_objid: string = '';

	export let newrole = '';

	//$title = team.teamid;
	$title = 'HyperFlow';

	let Designer: any;
	let theDesigner: any;

	$: team_json_string = JSON.stringify(team, null, 2);
	$: roles = typeof team.tmap === 'undefined' ? [] : Object.keys(team.tmap);

	export let menu_has_form = false;
	export let form_status = {
		create: false,
		search: false,
		sort: false,
		import: false,
		export: false,
		rename: false,
		copyto: false,
		delete: false
	};
	export let form_name = '';
	export let export_to_filename = team.teamid;
	export let errmsg = '';
	export let user: User;

	let fade_message = '';
	let fade_timer: any;
	function setFadeMessage(message: string, time = 2000) {
		fade_message = message;
		if (fade_timer) clearTimeout(fade_timer);
		fade_timer = setTimeout(() => {
			fade_message = '';
		}, time);
	}

	$: topmenu_class = form_name === '' ? '' : 'whiteback';
	function hide_all_form() {
		Object.keys(form_status).forEach((key) => {
			form_status[key] = false;
		});
		form_name = '';
		menu_has_form = false;
		errmsg = '';
	}
	function show_form(what: string) {
		hide_all_form();
		form_status[what] = true;
		form_name = what;
		menu_has_form = true;
	}
	function show_delete_team_modal() {
		hide_all_form();
	}
	const deleteRole = (name: string): void => {
		setTimeout(async () => {
			let ret = await api.post(
				'team/role/delete',
				{ teamid: team.teamid, role: name },
				user.sessionToken
			);
			refreshTeam(ret as Team);
		}, 1);
	};
	function delete_team() {
		hide_all_form();
		setTimeout(async () => {
			let ret = await api.post('team/delete', { teamid: team.teamid }, user.sessionToken);
			goto('/team', { replaceState: false });
		}, 1);
	}
	function removeElementsByClass(className) {
		const elements = document.getElementsByClassName(className);
		while (elements.length > 0) {
			elements[0].parentNode.removeChild(elements[0]);
		}
	}

	function export_team() {
		if (export_to_filename.endsWith('.csv'))
			export_to_filename = export_to_filename.substring(0, export_to_filename.lastIndexOf('.csv'));
		api
			.post(
				'team/download',
				{ teamid: team.teamid, filename: export_to_filename },
				user.sessionToken
			)
			.then((response) => {
				const url = window.URL.createObjectURL(new Blob([response]));
				removeElementsByClass('tempLink');
				const link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', `${export_to_filename}.csv`); //or any other extension
				link.setAttribute('class', 'tempLink');
				document.body.appendChild(link);
				//点击这个临时连接实现内容下载
				link.click();
				hide_all_form();
			});
	}
	let files;
	function upload(e) {
		e.preventDefault();
		const formData = new FormData();
		formData.append('teamid', team.teamid);
		formData.append('file', files[0]);
		const upload = fetch(`${API_SERVER}/team/import`, {
			method: 'POST',
			headers: {
				Authorization: user.sessionToken
			},
			body: formData
		})
			.then((response) => response.json())
			.then((result) => {
				team = result;
			})
			.catch((error) => {
				console.error('Error:', error);
			});
		hide_all_form();
	}

	export function refreshTeam(ateam: Team): void {
		team = ateam;
		$title = team.teamid;
	}
	function setMouseFocus() {}
	function setMouseOverObjid(objid: string): void {
		mouseover_objid = objid;
	}

	let urls = {
		create: `${API_SERVER}/team/create`,
		rename: `${API_SERVER}/team/rename`,
		copyto: `${API_SERVER}/team/copyto`,
		role_member_add: `${API_SERVER}/team/role/member/add`
	};
	async function showTab(tabId) {
		return;
	}
</script>

<svelte:head>
	<title>{team.teamid} • Team</title>
</svelte:head>
<Container>
	<div class="d-flex">
		<div class="flex-shrink-0">
			<h1>Team</h1>
		</div>
		<div class="mx-5 align-self-center flex-grow-1">{team.teamid}</div>
	</div>
</Container>
<Container>
	<TabContent
		class="kfk-tab-menu"
		on:tab={(e) => {
			showTab(e.detail);
		}}
	>
		<TabPane tabId="Search" active>
			<span slot="tab">
				<Icon name="person-lines-fill" />Team
			</span>
			<div class="mx-3">
				Current team id is: {team.teamid}
			</div>
		</TabPane>
		<TabPane tabId="export">
			<span slot="tab">
				<Icon name="cloud-download" />
				Export
			</span>
			<div class="mx-3">
				Export current team to:
				<input
					name="exorttoname"
					placeholder="Export to file"
					class="kfk_input_team_name"
					bind:value={export_to_filename}
					autocomplete="off"
				/>
				<Button on:click={() => export_team()} color="primary">Export</Button>
				{#if errmsg !== ''}{errmsg}{/if}
			</div>
		</TabPane>
		{#if ClientPermControl(user.perms, user.email, 'team', team, 'update')}
			<TabPane tabId="rename">
				<span slot="tab">
					<Icon name="input-cursor-text" />
					Rename
				</span>
				<div class="mx-3">
					<form
						action={urls.rename}
						method="post"
						use:enhance={{
							token: user.sessionToken,
							result: async (res, form) => {
								const newTeam = await res.json();
								if (newTeam.error) {
									errmsg = newTeam.errMsg;
									if (errmsg.indexOf('MongoError: E11000 duplicate key error') >= 0) {
										errmsg = '同名模板已存在, 请重新录入';
									}
								} else {
									refreshTeam(newTeam);
									goto(`/team/@${team.teamid}`, {
										replaceState: true,
										keepfocus: true,
										noscroll: true
									});
									form_status['rename'] = false;
									form.reset();
									errmsg = '';
								}
								hide_all_form();
							}
						}}
					>
						Rename {team.teamid} to:
						<input
							name="teamid"
							placeholder="Rename: new team name"
							class="kfk_input_team_name"
							value={team.teamid}
							autocomplete="off"
						/>
						<input type="hidden" name="fromid" value={team.teamid} />
						<Button type="submit" color="primary">Rename</Button>
						{#if errmsg !== ''}{errmsg}{/if}
					</form>
				</div>
			</TabPane>
		{/if}
		<TabPane tabId="copyto">
			<span slot="tab">
				<Icon name="files" />
				Copy to
			</span>

			<div class="mx-3">
				<form
					action={urls.copyto}
					method="post"
					use:enhance={{
						token: user.sessionToken,
						result: async (res, form) => {
							const newTeam = await res.json();
							if (newTeam.error) {
								errmsg = newTeam.errMsg;
								if (errmsg.indexOf('MongoError: E11000 duplicate key error') >= 0) {
									errmsg = '同名Team已存在, 请重新录入';
								}
							} else {
								refreshTeam(newTeam);
								goto(`/team/@${team.teamid}`, {
									replaceState: true,
									noscroll: true,
									keepfocus: true
								});
								form_status['copyto'] = false;
								form.reset();
								errmsg = '';
							}
							hide_all_form();
						}
					}}
				>
					Copy {team.teamid} to:
					<input
						name="teamid"
						placeholder="New team name"
						class="kfk_input_team_name"
						value={team.teamid}
						autocomplete="off"
					/>
					<input type="hidden" name="fromid" value={team.teamid} />
					<Button type="submit" color="primary">Copy</Button>
					{#if errmsg !== ''}{errmsg}{/if}
				</form>
			</div>
		</TabPane>
		{#if ClientPermControl(user.perms, user.email, 'team', team, 'delete')}
			<TabPane tabId="delete">
				<span slot="tab">
					<Icon name="trash" />
					Delete
				</span>
				<div class="mx-3">
					Are you sure to delete team: {team.teamid}? &nbsp;
					<Button on:click={() => delete_team()} color="primary">Delete</Button>
					{#if errmsg !== ''}{errmsg}{/if}
				</div>
			</TabPane>
		{/if}
	</TabContent>
</Container>
<Container class="mt-3">
	{#if ClientPermControl(user.perms, user.email, 'team', team, 'update')}
		<Row>
			<Col>
				<form
					action={urls.role_member_add}
					method="post"
					use:enhance={{
						token: user.sessionToken,
						result: async (res, form) => {
							const retObj = await res.json();
							if (retObj.error) {
								errmsg = retObj.errMsg;
							} else {
								team = retObj;
								form.reset();
								errmsg = '';
							}
						}
					}}
				>
					<h4>Add New Role:</h4>
					<input name="role" placeholder="New role id" bind:value={newrole} autocomplete="off" />
					<input type="hidden" name="teamid" value={team.teamid} />
					<Button type="submit" color="primary" size="sm">Add</Button>
					<Button
						size="sm"
						on:click={(e) => {
							e.preventDefault();
							newrole = '';
						}}
						color="secondary">Reset</Button
					>
					{#if errmsg !== ''}{errmsg}{/if}
				</form>
			</Col>
		</Row>
	{/if}
	<Row class="mt-5">
		<Col xs="12">
			<h4>Roles:</h4>
		</Col>
	</Row>
	<Row>
		<Col xs="12">
			{#if roles.length === 0}
				<div class="article-preview">No roles are here... yet.</div>
			{:else}
				{#each roles as aRole (aRole)}
					<div
						class="mt-3"
						transition:scale|local={{ start: 0.7 }}
						animate:flip={{ duration: 200 }}
						on:focus={() => setMouseFocus()}
						on:mouseover={() => setMouseOverObjid(aRole)}
					>
						<RolePreview {team} {user} {aRole} {mouseover_objid} {deleteRole} {refreshTeam} />
					</div>
				{/each}
			{/if}
		</Col>
	</Row>
</Container>
