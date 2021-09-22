<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		const res = await fetch('/template.json');
		return {
			props: {
				templates: await res.json(),
				user: session.user,
				config: session.config
			}
		};
	}
</script>

<script lang="ts">
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
	import { enhance } from '$lib/form';
	import TemplateList from './_TemplateList.svelte';
	export let templates: Template[];
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
		templates = templates.sort((a, b): number => {
			let A: number | string = field === 'name' ? a.tplid : Date.parse(a.updatedAt);
			let B: number | string = field === 'name' ? b.tplid : Date.parse(b.updatedAt);
			if (A === B) {
				return 0;
			} else if (A > B) {
				return order;
			} else return 0 - order;
		});
		/*
		setTimeout(async () => {
			const res = await api.post(
				'template/search',
				{
					tplid: lastSearchCondition,
					sort_field: field==='name'?'tplid':field,
					sort_order: order
				},
				user.sessionToken
			);
			console.log(res);
			templates = res; //eslint-disable-line
			for (let i = 0; i < templates.length; i++) {
				console.log(Date.parse(templates[i].updatedAt));
			}
		}, 0);
		*/
	}
	const deleteTemplate = (name: string) => {
		setTimeout(async () => {
			let ret = await api.post('template/delete/byname', { tplid: name }, user.sessionToken);
			templates = templates.filter((t: Template) => {
				return t.tplid !== name;
			});
		}, 1);
	};

	let files;
	let theSearchForm;
	let dataFile = null;
	let tplidImport;

	function upload(e) {
		e.preventDefault();
		const formData = new FormData();
		formData.append('tplid', tplidImport);
		formData.append('file', files[0]);
		const upload = fetch('http://localhost:5008/template/import', {
			method: 'POST',
			headers: {
				Authorization: user.sessionToken
			},
			body: formData
		})
			.then((response) => response.json())
			.then((result) => {
				console.log('Success:', result);
				templates = [result, ...templates];
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
</script>

<Container>
	<Row>
		<Col class="d-flex justify-content-center">
			<h1 class="text-xs-center">Workflow Templates</h1>
		</Col>
	</Row>
	<Row class="kfk-list-header">
		<Col>
			<Nav>
				<NavLink
					on:click={() => {
						show_form('create');
					}}
				>
					<Icon name="plus-circle" />
					New
				</NavLink>
				<NavLink
					on:click={() => {
						show_form('search');
					}}
				>
					<Icon name="search" />
					Search
				</NavLink>
				<NavLink
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
	<Row class="kfk-bottom-10">
		<Col>
			{#if form_status.create}
				<form
					class="new"
					action="http://localhost:5008/template/create"
					method="post"
					use:enhance={{
						token: user.sessionToken,
						result: async (res, form) => {
							const created = await res.json();
							console.log(created);
							if (created.error) {
								console.log(created.error);
							} else {
								templates = [created, ...templates];
								lastSearchCondition = created.tplid;
							}
							form.reset();
							//form_status['create'] = false;
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
			{:else if form_status.search}
				<form
					class="new"
					action="http://localhost:5008/template/search"
					method="post"
					use:enhance={{
						token: user.sessionToken,
						result: async (res, form) => {
							const tmp = await res.json();
							if (tmp.error) {
								console.log(tmp.error);
							} else {
								templates = tmp;
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
									aria-label="Search template"
									placeholder="What to search for"
									class="kfk-input-template-name"
								/>
							</Col>
							<Col>
								<Button size="sm" type="submit" color="primary" bind:this={theSearchForm}>
									Search
								</Button>
								<Button
									size="sm"
									on:click={() => {
										lastSearchCondition = '';
									}}
									color="secondary">Show All</Button
								>
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
	<TemplateList {templates} {deleteTemplate} />
</Container>
