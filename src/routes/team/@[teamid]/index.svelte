<script context="module" lang="ts">
	export const ssr = false;
	export async function load({ page, fetch, session }) {
		const teamid = page.params.teamid;
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
	import type { User, Team } from '$lib/types';
	import jQuery from 'jquery';
	import RolePreview from './_RolePreview.svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { title } from '$lib/title';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import { Container, Row, Col, Nav, Icon, NavItem, NavLink } from 'sveltestrap';
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
	import { enhance } from '$lib/form';
	export let team: Team;
	export let mouseover_objid: string = '';

	export let newrole = '';
	const jq = jQuery;

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
			refreshTeam(ret);

			/*
			teams = teams.filter((t: Team) => {
				return t.teamid !== name;
			});
			*/
		}, 1);
	};
	function delete_team() {
		hide_all_form();
		setTimeout(async () => {
			let ret = await api.post('team/delete', { teamid: team.teamid }, user.sessionToken);
			goto('/team', { replaceState: false });
		}, 1);
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
				jq('.tempLink').remove();
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
		const upload = fetch('http://localhost:5008/team/import', {
			method: 'POST',
			headers: {
				Authorization: user.sessionToken
			},
			body: formData
		})
			.then((response) => response.json())
			.then((result) => {
				console.log('Success:', result);
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
</script>

<svelte:head>
	<title>{team.teamid} • Team</title>
</svelte:head>
<Container>
	<Row>
		<Col class="d-flex justify-content-center">
			<h2>Team {team.teamid}</h2>
		</Col>
	</Row>
</Container>
<div class="kfk-menu" class:menu_has_form>
	<Container>
		<Row>
			<Col class="mt-1">
				<Nav>
					<NavLink
						class="kfk-link"
						href="#"
						on:click={() => {
							show_form('create');
						}}
					>
						<Icon name="plus-circle" />
						New
					</NavLink>
					<NavLink
						class="kfk-link"
						href="#"
						on:click={() => {
							show_form('import');
						}}
					>
						<Icon name="cloud-upload" />
						Import
					</NavLink>
					<NavLink
						class="kfk-link"
						href="#"
						on:click={() => {
							show_form('export');
						}}
					>
						<Icon name="cloud-download" />
						Export
					</NavLink>
					<NavLink
						class="kfk-link"
						href="#"
						on:click={() => {
							show_form('rename');
						}}
					>
						<Icon name="input-cursor-text" />
						Rename
					</NavLink>
					<NavLink
						class="kfk-link"
						href="#"
						on:click={() => {
							show_form('copyto');
						}}
					>
						<Icon name="files" />
						Copy to
					</NavLink>
					<NavLink
						class="kfk-link"
						href="#"
						on:click={() => {
							show_form('delete');
						}}
					>
						<Icon name="trash" />
						Delete
					</NavLink>
				</Nav>
			</Col>
		</Row>
		<Row class="mt-2">
			<Col>
				{#if form_status.create}
					<form
						action="http://localhost:5008/team/create"
						method="post"
						use:enhance={{
							token: user.sessionToken,
							result: async (res, form) => {
								const created = await res.json();
								console.log(created);
								if (created.error) {
									console.log(created.error);
									errmsg = created.errMsg;
									if (errmsg.indexOf('MongoError: E11000 duplicate key error') >= 0) {
										errmsg = '同名模板已存在, 请重新录入';
									}
								} else {
									team = created;
									goto(`/team/@${team.teamid}`, {
										replaceState: false,
										keepfocus: true
									});
									form_status['create'] = false;
									form.reset();
									errmsg = '';
								}
								hide_all_form();
							}
						}}
					>
						New team name:
						<input
							name="teamid"
							aria-label="Create team"
							placeholder="New team name"
							class="kfk_input_team_name"
							autocomplete="off"
						/>
						<Button type="submit" color="primary">Create</Button>
						<Button
							on:click={(e) => {
								e.preventDefault();
								hide_all_form();
							}}
							color="secondary">Cancel</Button
						>
						{#if errmsg !== ''}{errmsg}{/if}
					</form>
				{:else if form_status.import}
					<form class="new" enctype="multipart/form-data">
						<input name="teamid" type="hidden" value={team.teamid} />
						<input name="file" type="file" class="kfk_input_team_name" bind:files />
						<Button on:click={upload} color="primary">Import</Button>
						<Button on:click={hide_all_form} color="secondary">Cancel</Button>
					</form>
				{:else if form_status.export}
					Export current team to:
					<input
						name="exorttoname"
						placeholder="Export to file"
						class="kfk_input_team_name"
						bind:value={export_to_filename}
						autocomplete="off"
					/>
					<Button on:click={() => export_team()} color="primary">Export</Button>
					<Button
						on:click={(e) => {
							e.preventDefault();
							hide_all_form();
						}}
						color="secondary">Cancel</Button
					>
					{#if errmsg !== ''}{errmsg}{/if}
				{:else if form_status.rename}
					<form
						action="http://localhost:5008/team/rename"
						method="post"
						use:enhance={{
							token: user.sessionToken,
							result: async (res, form) => {
								const newTeam = await res.json();
								console.log(newTeam);
								if (newTeam.error) {
									console.log(newTeam.error);
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
						<Button
							on:click={(e) => {
								e.preventDefault();
								hide_all_form();
							}}
							color="secondary">Cancel</Button
						>
						{#if errmsg !== ''}{errmsg}{/if}
					</form>
				{:else if form_status.copyto}
					<form
						action="http://localhost:5008/team/copyto"
						method="post"
						use:enhance={{
							token: user.sessionToken,
							result: async (res, form) => {
								const newTeam = await res.json();
								console.log(newTeam);
								if (newTeam.error) {
									console.log(newTeam.error);
									errmsg = newTeam.errMsg;
									if (errmsg.indexOf('MongoError: E11000 duplicate key error') >= 0) {
										errmsg = '同名模板已存在, 请重新录入';
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
						<Button
							on:click={(e) => {
								e.preventDefault();
								hide_all_form();
							}}
							color="secondary">Cancel</Button
						>
						{#if errmsg !== ''}{errmsg}{/if}
					</form>
				{:else if form_status.delete}
					Are you sure to delete team: {team.teamid}? &nbsp;
					<Button on:click={() => delete_team()} color="primary">Delete</Button>
					<Button
						on:click={(e) => {
							e.preventDefault();
							hide_all_form();
						}}
						color="secondary">Cancel</Button
					>
					{#if errmsg !== ''}{errmsg}{/if}
				{/if}
			</Col>
		</Row>
	</Container>
</div>
<Container>
	<Row>
		<Col>
			<form
				action="http://localhost:5008/team/role/member/add"
				method="post"
				use:enhance={{
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
</Container>
<Container style="padding-top:20px">
	<Row>
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
