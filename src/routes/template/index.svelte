<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		try {
			return {
				props: {
					user: session.user
				}
			};
		} catch (err) {
			return {
				props: {
					user: session.user
				}
			};
		}
	}
</script>

<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import Parser from '$lib/parser';
	import RemoteTable from './RemoteTable.svelte';
	import ErrorProcessor from '$lib/errorProcessor';
	import { get } from 'svelte/store';
	import type { WhichTab } from '$lib/types';
	import { whichTabStore } from '$lib/empstores';
	import { ClientPermControl } from '$lib/clientperm';
	import { TabContent, Fade, Card, TabPane } from 'sveltestrap';
	import type { User } from '$lib/types';
	import { session } from '$app/stores';
	import { Container, Row, Col, Styles, Icon, Button, Nav, NavLink } from 'sveltestrap';
	import { enhance } from '$lib/form';
	export let menu_has_form = false;
	export let user: User;
	export let lastSearchCondition: string = '';
	export let form_status = { create: false, search: false, sort: false, import: false };
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	$: token = user.sessionToken;
	let remoteTable;
	function hide_all_form() {
		Object.keys(form_status).forEach((key) => {
			form_status[key] = false;
		});
		menu_has_form = false;
	}
	function show_form(form_name: string) {
		hide_all_form();
		form_status[form_name] = true;
		menu_has_form = true;
	}

	let files;
	let tplidImport;

	let urls = {
		create: `${API_SERVER}/template/create`,
		search: `${API_SERVER}/template/search`
	};

	function upload(e) {
		e.preventDefault();
		if (ClientPermControl(user.perms, user.email, 'template', '', 'create') === false) {
			setFadeMessage("You don't have upload permission");
			return;
		}
		const formData = new FormData();
		formData.append('tplid', tplidImport);
		formData.append('file', files[0]);
		const upload = fetch(`${API_SERVER}/template/import`, {
			method: 'POST',
			headers: {
				Authorization: user.sessionToken
			},
			body: formData
		})
			.then((response) => response.json())
			.then(async (result) => {
				console.log('Success:', result);
				//templates = [result, ...templates];
				remoteTable.rows = [result, ...remoteTable.rows];
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
	let whichTab: WhichTab = get(whichTabStore);
	async function showTab(tabId) {
		whichTab = get(whichTabStore);
		if (whichTab) {
			whichTab['template'] = tabId;
			whichTabStore.set(whichTab);
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

<Styles />

<Container>
	<div class="d-flex">
		<div class="flex-shrink-0">
			<h1>Templates</h1>
		</div>
		<div class="mx-5 align-self-center flex-grow-1">Defines how workflow would be running</div>
	</div>
</Container>
<Container>
	<TabContent
		class="kfk-tab-menu"
		on:tab={(e) => {
			showTab(e.detail);
		}}
	>
		<TabPane tabId="home" active={!whichTab || whichTab['template'] === 'home'}>
			<span slot="tab">
				<Icon name="code-square" />
				Template
			</span>
			<div class="mx-3">A template describe how a workflow sould run</div>
		</TabPane>
		{#if user.perms && ClientPermControl(user.perms, user.email, 'template', '', 'create')}
			<TabPane tabId="create" active={whichTab && whichTab['template'] === 'create'}>
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
							return ClientPermControl(user.perms, user.email, 'template', '', 'create');
						},
						token: user.sessionToken,
						result: async (res, form) => {
							const created = await res.json();
							/* templates = [created, ...templates]; */
							lastSearchCondition = created.tplid;
							remoteTable.rows = [created, ...remoteTable.rows];
							remoteTable.rowsCount = remoteTable.rowsCount + 1;
							form.reset();
							//form_status['create'] = false;
						},
						error: async (res, error, form) => {
							let retError = await res.json();
							let tmp = ErrorProcessor.setError(retError.errors, '<br />');
							$session.errors = tmp;
							setTimeout(() => {
								$session.errors = '';
							}, 2000);
						}
					}}
				>
					<Container class="mt-3">
						<Row>
							<Col>
								<input
									name="tplid"
									aria-label="Create template"
									placeholder="New template name"
									class="kfk-input-template-name"
								/>
							</Col>
							<Col>
								<Button size="sm" type="submit" color="primary">Create</Button>
							</Col>
						</Row>
					</Container>
				</form>
			</TabPane>
			<TabPane tabId="import" active={whichTab && whichTab['template'] === 'import'}>
				<span slot="tab">
					<Icon name="cloud-upload" />
					Import
				</span>
				<form class="new" enctype="multipart/form-data">
					<Container class="mt-3">
						<Row>
							<Col>
								<input
									name="tplid"
									placeholder="New template name"
									class="kfk-input-template-name"
									bind:value={tplidImport}
								/>
							</Col>
							<Col>
								<input name="file" type="file" class="kfk_input_template_name" bind:files />
							</Col>
							<Col>
								<Button size="sm" on:click={upload} color="primary">Import</Button>
							</Col>
						</Row>
					</Container>
				</form>
			</TabPane>
		{/if}
	</TabContent>
</Container>
<Container class="mt-3">
	<Row class="mt-3">
		<Col>
			<RemoteTable endpoint="template/search" {token} {user} bind:this={remoteTable} />
		</Col>
	</Row>
</Container>
<Fade isOpen={fade_message != ''}>
	<Card body>
		{fade_message}
	</Card>
</Fade>
