<script context="module" lang="ts">
	let TimeTool = null;
	export async function load({ page, fetch, session }) {
		TimeTool = (await import('$lib/TimeTool')).default;
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
	import RemoteTable from './RemoteTable.svelte';
	import { get } from 'svelte/store';
	import type { WhichTab } from '$lib/types';
	import { whichTabStorage } from '$lib/empstores';
	import { ClientPermControl } from '$lib/clientperm';
	import Parser from '$lib/parser';
	import * as api from '$lib/api';
	import { Container, Row, Col, Icon, Button, Fade, Card } from 'sveltestrap';

	import type { User, Team, Config } from '$lib/types';
	import { enhance } from '$lib/form';
	import { TabContent, TabPane } from 'sveltestrap';
	export let teams: Team[];
	export let user: User;
	export let config: Config;
	export let lastSearchCondition: string = '';
	export let form_status = { create: false, search: false, sort: false, import: false };
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	$: token = user.sessionToken;
	let remoteTable;
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
	}
	let files;
	let theSearchForm;
	let dataFile = null;
	let teamidImport;

	function upload(e) {
		e.preventDefault();
		if (ClientPermControl(user.perms, user.email, 'team', '', 'create') === false) {
			setFadeMessage("You don't have create team permission");
			return;
		}
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
				remoteTable.rows = [result, ...remoteTable.rows];
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
	let whichTab: WhichTab = get(whichTabStorage);
	async function showTab(tabId) {
		whichTab = get(whichTabStorage);
		if (whichTab) {
			whichTab['team'] = tabId;
			whichTabStorage.set(whichTab);
		}
	}

	let fade_message = '';
	let fade_timer: any;
	function setFadeMessage(message: string, time = 2000) {
		fade_message = message;
		if (fade_timer) clearTimeout(fade_timer);
		fade_timer = setTimeout(() => {
			fade_message = '';
		}, time);
	}
</script>

<Container>
	<div class="d-flex">
		<div class="flex-shrink-0 fs-3">Teams</div>
		<div class="mx-5 align-self-center flex-grow-1">
			Map role definition in template to real people
		</div>
	</div>
</Container>
<Container>
	<TabContent
		class="kfk-tab-menu"
		on:tab={(e) => {
			showTab(e.detail);
		}}
	>
		<TabPane tabId="search" active={!whichTab || whichTab['team'] === 'search'}>
			<span slot="tab">
				<Icon name="code-square" />
				Team
			</span>
			<div class="mx-3">
				Team is used to define the mapping between workflow roles and real people.
			</div>
		</TabPane>
		<TabPane tabId="create" active={whichTab && whichTab['team'] === 'create'}>
			<span slot="tab">
				<Icon name="plus-circle" />
				Create
			</span>
			<form
				class="new"
				action={urls.create}
				method="post"
				use:enhance={{
					preCheck: () => {
						return ClientPermControl(user.perms, user.email, 'team', '', 'create');
					},
					token: user.sessionToken,
					result: async (res, form) => {
						const created = await res.json();
						console.log(created);
						if (created.error) {
							if (created.errMsg.indexOf('duplicate key error') > 0) {
								console.log('Dupliated key', '//TODO');
							} else console.log(created.error);
						} else {
							lastSearchCondition = created.teamid;
							remoteTable.rows = [created, ...remoteTable.rows];
							remoteTable.rowsCount = remoteTable.rowsCount + 1;
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
		</TabPane>
		<TabPane tabId="import" active={whichTab && whichTab['team'] === 'import'}>
			<span slot="tab">
				<Icon name="cloud-upload" />
				Import
			</span>
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
		</TabPane>
	</TabContent>
</Container>
<Container class="mt-3">
	<Row class="mt-3">
		<Col>
			<RemoteTable endpoint="team/search" {token} {user} bind:this={remoteTable} {TimeTool} />
		</Col>
	</Row>
</Container>
<Fade isOpen={fade_message != ''} class="kfk-fade">
	<Card body>
		{fade_message}
	</Card>
</Fade>
