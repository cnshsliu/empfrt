<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		return {
			props: {
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import RemoteTable from './RemoteTable.svelte';
	import ErrorProcessor from '$lib/errorProcessor';
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
	console.log(user);
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
</script>

<Styles />

<Container>
	<Row>
		<Col class="d-flex justify-content-center">
			<h1 class="text-center">Workflow Templates</h1>
		</Col>
	</Row>
</Container>
<Container class="kfk-menu">
	<Row class="kfk-menu-border">
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
						show_form('import');
					}}
				>
					<Icon name="cloud-upload" />
					Import
				</NavLink>
			</Nav>
		</Col>
	</Row>
	{#if menu_has_form}
		<Row class="mt-2 pb-2 kfk-menu-border">
			<Col>
				{#if form_status.create}
					<!-- svelte-ignore missing-declaration -->
					<form
						class="new"
						action={urls.create}
						method="post"
						use:enhance={{
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
								console.log('Here0');
								let retError = await res.json();
								let tmp = ErrorProcessor.setError(retError.errors, '<br />');
								$session.errors = tmp;
								setTimeout(() => {
									$session.errors = '';
								}, 2000);
							}
						}}
					>
						<Container>
							<Row
								><Col>
									<input
										name="tplid"
										aria-label="Create template"
										placeholder="New template name"
										class="kfk-input-template-name"
									/>
								</Col>
								<Col>
									<Button size="sm" type="submit" color="primary">Create</Button>
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
									<Button size="sm" on:click={hide_all_form} color="secondary">Cancel</Button>
								</Col>
							</Row>
						</Container>
					</form>
				{/if}
			</Col>
		</Row>
	{/if}
	<Row class="mt-3">
		<Col>
			<RemoteTable endpoint="template/search" {token} bind:this={remoteTable} />
		</Col>
	</Row>
</Container>
