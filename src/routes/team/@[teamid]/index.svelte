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
	import jQuery from 'jquery';
	import { session } from '$app/stores';
	import { title } from '$lib/title';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import { Container, Row, Col, Nav, NavLink } from 'sveltestrap';
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
	import { enhance } from '$lib/form';
	export let team: Team;

	const jq = jQuery;

	$title = team.teamid;

	let Designer: any;
	let theDesigner: any;
	onMount(async () => {
		console.log('in onMount', team.teamid);
	});

	export let form_status = {
		create: false,
		search: false,
		sort: false,
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
		errmsg = '';
	}
	function show_form(what: string) {
		hide_all_form();
		form_status[what] = true;
		form_name = what;
	}
	function show_delete_team_modal() {
		hide_all_form();
	}
	function delete_team() {
		hide_all_form();
		setTimeout(async () => {
			let ret = await api.post('team/delete', { teamid: team.teamid }, user.sessionToken);
			goto('/team', { replaceState: false });
		}, 1);
	}
	function export_team() {
		if (export_to_filename.endsWith('.xml'))
			export_to_filename = export_to_filename.substring(0, export_to_filename.lastIndexOf('.xml'));
		api.post('team/download', { teamid: team.teamid }, user.sessionToken).then((response) => {
			const url = window.URL.createObjectURL(new Blob([response]));
			jq('.tempLink').remove();
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `${export_to_filename}.xml`); //or any other extension
			link.setAttribute('class', 'tempLink');
			document.body.appendChild(link);
			//点击这个临时连接实现内容下载
			link.click();
			hide_all_form();
		});
	}
</script>

<svelte:head>
	<title>{team.teamid} • Conduit</title>
</svelte:head>
<div id="topMenu" class={topmenu_class}>
	<Container>
		<Row>
			<Col>
				<Nav>
					<NavLink
						class="kfk-link"
						href="#"
						on:click={() => {
							show_form('create');
						}}
						>New
					</NavLink>
					<NavLink
						class="kfk-link"
						href="#"
						on:click={() => {
							show_form('export');
						}}
						>Export
					</NavLink>
					<NavLink
						class="kfk-link"
						href="#"
						on:click={() => {
							show_form('rename');
						}}
						>Rename
					</NavLink>
					<NavLink
						class="kfk-link"
						href="#"
						on:click={() => {
							show_form('copyto');
						}}
						>Copy to
					</NavLink>
					<NavLink
						class="kfk-link"
						href="#"
						on:click={() => {
							show_form('delete');
						}}
						>Delete
					</NavLink>
				</Nav>
			</Col>
		</Row>
		{#if form_status.create}
			<Row>
				<Col>
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
							autofocus
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
				</Col>
			</Row>
		{:else if form_status.export}
			<Row>
				<Col>
					Export current team to:
					<input
						name="exorttoname"
						placeholder="Export to file"
						class="kfk_input_team_name"
						bind:value={export_to_filename}
						autofocus
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
				</Col>
			</Row>
		{:else if form_status.rename}
			<Row>
				<Col>
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
									team = newTeam;
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
							autofocus
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
				</Col>
			</Row>
		{:else if form_status.copyto}
			<Row>
				<Col>
					<form
						class="new"
						action="http://localhost:5008/team/copyto"
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
							autofocus
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
				</Col>
			</Row>
		{:else if form_status.delete}
			<Row>
				<Col>
					<div>Are you sure to delete team:</div>
					<div>
						{team.teamid}?
					</div>
					<div>&nbsp;</div>
					<Button on:click={() => delete_team()} color="primary">Delete</Button>
					<Button
						on:click={(e) => {
							e.preventDefault();
							hide_all_form();
						}}
						color="secondary">Cancel</Button
					>
					{#if errmsg !== ''}{errmsg}{/if}
				</Col>
			</Row>
		{/if}
	</Container>
</div>
<Container style="margin-top:100px">
	{JSON.stringify(team)}
</Container>
