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
	import { API_SERVER } from '$lib/Env';
	import * as api from '$lib/api';
	import {
		Container,
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
		Input,
		Nav,
		NavLink
	} from 'sveltestrap';

	import type { User, Team, Config } from '$lib/types';
	import { enhance } from '$lib/form';
	import TeamList from './_TeamList.svelte';
	export let teams: Team[];
	export let user: User;
	export let config: Config;
	export let lastSearchCondition: string = '';
	export let form_status = { create: false, search: false, sort: false, import: false };
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	export let form_name = '';
	export let menu_has_form = false;
	let urls = {
		import: `${API_SERVER}/team/import`,
		create: `${API_SERVER}/team/create`,
		search: `${API_SERVER}/team/search`
	};
	function hide_all_form() {
		Object.keys(form_status).forEach((key) => {
			form_status[key] = false;
		});
		form_name = '';
		menu_has_form = false;
	}
	function show_form(form_name: string) {
		hide_all_form();
		form_status[form_name] = true;
		form_name = form_name;
		menu_has_form = true;
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
	const deleteTeam = (name: string): void => {
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
		const upload = fetch(urls.import, {
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

<Container>
	<Row>
		<Col class="d-flex justify-content-center">
			<h1 class="text-xs-center">Team Configuration</h1>
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
						on:click={() => {
							show_form('create');
						}}
					>
						<Icon name="plus-circle" />
						New
					</NavLink>
					<NavLink
						class="kfk-link"
						on:click={() => {
							show_form('search');
						}}
					>
						<Icon name="search" />
						Search
					</NavLink>
					<NavLink
						class="kfk-link"
						on:click={() => {
							show_form('import');
						}}
					>
						<Icon name="cloud-upload" />
						Import
					</NavLink>
				</Nav>
			</Col>
			<Col class="d-flex justify-content-end">
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
							class={config.sort.field === 'updatedAt' && config.sort.order === 1 ? 'active' : ''}
						>
							<a href={'#'} on:click|preventDefault={() => sortBy('updatedAt', 1)} class="nav-link"
								><Icon name="sort-numeric-down" />
								Date: old first
							</a>
						</DropdownItem>
						<DropdownItem
							class={config.sort.field === 'updatedAt' && config.sort.order === -1 ? 'active' : ''}
						>
							<a href={'#'} on:click|preventDefault={() => sortBy('updatedAt', -1)} class="nav-link"
								><Icon name="sort-numeric-down-alt" />
								Date: newly first
							</a>
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</Col>
		</Row>
		<Row class="mt-2">
			<Col>
				{#if form_status.create}
					<form
						class="new"
						action={urls.create}
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
						<Container>
							<Row>
								<Col>
									<input
										name="teamid"
										aria-label="Create team"
										placeholder="New team name"
										class="kfk-input-team-name"
									/>
								</Col>
								<Col>
									<Button size="sm" type="submit" color="primary">Create</Button>
									<Button size="sm" on:click={hide_all_form} color="secondary">Cancel</Button>
								</Col>
							</Row>
						</Container>
					</form>
				{:else if form_status.search}
					<form
						class="new"
						action={urls.search}
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
						<Container>
							<Row>
								<Col>
									<input name="sort_field" type="hidden" bind:value={config.sort.field} />
									<input name="sort_order" type="hidden" bind:value={config.sort.order} />
									<input
										name="pattern"
										bind:value={lastSearchCondition}
										aria-label="Search team"
										placeholder="What to search for"
										class="kfk-input-team-name"
									/>
								</Col>
								<Col>
									<Button size="sm" type="submit" color="primary" bind:this={theSearchForm}
										>Search</Button
									>
									<Button
										size="sm"
										on:click={() => {
											lastSearchCondition = '';
										}}
										color="secondary"
									>
										Show All
									</Button>
									<Button size="sm" on:click={hide_all_form} color="secondary">Cancel</Button>
								</Col>
							</Row>
						</Container>
					</form>
				{:else if form_status.import}
					<form class="new" enctype="multipart/form-data">
						<Container>
							<Row>
								<Col>
									<input
										name="teamid"
										placeholder="New team name"
										class="kfk-input-team-name"
										bind:value={teamidImport}
									/>
								</Col>
								<Col>
									<input name="file" type="file" class="kfk_input_team_name" bind:files />
								</Col>
								<Col>
									<Button size="sm" on:click={upload} color="primary">Import</Button>
									<Button size="sm" on:click={hide_all_form} color="secondary">Cancel</Button>
								</Col>
							</Row>
						</Container>
					</form>
				{/if}
			</Col>
		</Row>
	</Container>
</div>
<Container>
	<TeamList {teams} {deleteTeam} />
</Container>
