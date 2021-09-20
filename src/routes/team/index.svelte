<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		const res = await fetch('/team.json');

		return {
			props: {
				teams: await res.json(),
				user: session.user,
				config: session.config
			}
		};
	}
</script>

<script lang="ts">
	import * as api from '$lib/api';
	import {
		Row,
		Col,
		Icon,
		Button,
		Dropdown,
		DropdownItem,
		DropdownMenu,
		DropdownToggle,
		FormGroup,
		Label,
		Input
	} from 'sveltestrap';

	import { enhance } from '$lib/form';
	import TeamList from './_TeamList.svelte';
	export let teams: Team[];
	export let user: User;
	export let config: Config;
	export let lastSearchCondition: string = '';
	export let form_status = { create: false, search: false, sort: false, import: false };
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	function hide_all_form() {
		Object.keys(form_status).forEach((key) => {
			form_status[key] = false;
		});
	}
	function show_form(form_name: string) {
		hide_all_form();
		form_status[form_name] = true;
	}
	function sortBy(field: string, order: number) {
		config.sort = { field, order };
		teams = teams.sort((a, b): number => {
			let A: number | string = field === 'name' ? a.teamid : Date.parse(a.updatedAt);
			let B: number | string = field === 'name' ? b.teamid : Date.parse(b.updatedAt);
			if (A === B) {
				return 0;
			} else if (A > B) {
				return order;
			} else return 0 - order;
		});
		/*
		setTimeout(async () => {
			const res = await api.post(
				'team/search',
				{
					teamid: lastSearchCondition,
					sort_field: field==='name'?'teamid':field,
					sort_order: order
				},
				user.sessionToken
			);
			console.log(res);
			teams = res; //eslint-disable-line
			for (let i = 0; i < teams.length; i++) {
				console.log(Date.parse(teams[i].updatedAt));
			}
		}, 0);
		*/
	}
	const deleteTeam = (name: string) => {
		setTimeout(async () => {
			let ret = await api.post('team/delete', { teamid: name }, user.sessionToken);
			teams = teams.filter((t: Team) => {
				return t.teamid !== name;
			});
		}, 1);
	};

	let files;
	let theSearchForm;
	let dataFile = null;
	let teamidImport;

	function upload(e) {
		e.preventDefault();
		const formData = new FormData();
		formData.append('teamid', teamidImport);
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
				teams = [result, ...teams];
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
</script>

<div class="settings-page">
	<div class="container page">
		<div class="row">
			<div class="col-12">
				<h1 class="text-xs-center">Teams</h1>
				<ul class="nav nav-pills outline-active">
					<li class="nav-item kfk-link">
						<a href={'#'} on:click|preventDefault={() => show_form('create')} class="nav-link"
							>New</a
						>
					</li>
					<li class="nav-item kfk-link">
						<a href={'#'} on:click|preventDefault={() => show_form('search')} class="nav-link"
							>Search</a
						>
					</li>
					<li class="nav-item kfk-link">
						<a href={'#'} on:click|preventDefault={() => show_form('import')} class="nav-link"
							>Import</a
						>
					</li>
					<li class="nav-item kfk-link">&nbsp;</li>
					<li class="nav-item kfk-link">
						<Dropdown>
							<DropdownToggle caret color="notexist">Sort by</DropdownToggle>
							<DropdownMenu class="kfk-dropdown">
								<DropdownItem
									class={config.sort.field === 'name' && config.sort.order === 1 ? 'active' : ''}
								>
									<a href={'#'} on:click|preventDefault={() => sortBy('name', 1)} class="nav-link "
										><Icon name="sort-alpha-down" />
										Name: A-Z
									</a>
								</DropdownItem>
								<DropdownItem
									class={config.sort.field === 'name' && config.sort.order === -1 ? 'active' : ''}
								>
									<a href={'#'} on:click|preventDefault={() => sortBy('name', -1)} class="nav-link "
										><Icon name="sort-alpha-down-alt" />
										Name: Z-A
									</a>
								</DropdownItem>
								<DropdownItem
									class={config.sort.field === 'updatedAt' && config.sort.order === 1
										? 'active'
										: ''}
								>
									<a
										href={'#'}
										on:click|preventDefault={() => sortBy('updatedAt', 1)}
										class="nav-link"
										><Icon name="sort-numeric-down" />
										Date: old first
									</a>
								</DropdownItem>
								<DropdownItem
									class={config.sort.field === 'updatedAt' && config.sort.order === -1
										? 'active'
										: ''}
								>
									<a
										href={'#'}
										on:click|preventDefault={() => sortBy('updatedAt', -1)}
										class="nav-link"
										><Icon name="sort-numeric-down-alt" />
										Date: newly first
									</a>
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</li>
				</ul>
				{#if form_status.create}
					<form
						class="new"
						action="http://localhost:5008/team/create"
						method="post"
						use:enhance={{
							token: user.sessionToken,
							result: async (res, form) => {
								const created = await res.json();
								console.log(created);
								if (created.error) {
									console.log(created.error);
								} else {
									teams = [created, ...teams];
									lastSearchCondition = created.teamid;
								}
								form.reset();
								//form_status['create'] = false;
							}
						}}
					>
						<input
							name="teamid"
							aria-label="Create team"
							placeholder="New team name"
							class="kfk_input_team_name"
						/>
						<Button type="submit" color="primary">Create</Button>
						<Button on:click={hide_all_form} color="secondary">Cancel</Button>
					</form>
				{:else if form_status.search}
					<form
						class="new"
						action="http://localhost:5008/team/search"
						method="post"
						use:enhance={{
							token: user.sessionToken,
							result: async (res, form) => {
								const tmp = await res.json();
								if (tmp.error) {
									console.log(tmp.error);
								} else {
									teams = tmp;
								}
								//form_status['search'] = false;
							}
						}}
					>
						<input name="sort_field" type="hidden" bind:value={config.sort.field} />
						<input name="sort_order" type="hidden" bind:value={config.sort.order} />
						<input
							name="pattern"
							bind:value={lastSearchCondition}
							aria-label="Search team"
							placeholder="What to search for"
							class="kfk_input_team_name"
						/>
						<Button type="submit" color="primary" bind:this={theSearchForm}>Search</Button>
						<Button
							on:click={() => {
								lastSearchCondition = '';
							}}
							color="secondary">Show All</Button
						>
						<Button on:click={hide_all_form} color="secondary">Cancel</Button>
					</form>
				{:else if form_status.import}
					<form class="new" enctype="multipart/form-data">
						<input
							name="teamid"
							placeholder="New team name"
							class="kfk_input_team_name"
							bind:value={teamidImport}
						/>
						<input name="file" type="file" class="kfk_input_team_name" bind:files />
						<Button on:click={upload} color="primary">Import</Button>
						<Button on:click={hide_all_form} color="secondary">Cancel</Button>
					</form>
				{/if}
				<hr />
			</div>
		</div>
		<TeamList {teams} {deleteTeam} />
	</div>
</div>
