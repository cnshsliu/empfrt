<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		const res = await fetch('/workflow.json');
		return {
			props: {
				workflows: await res.json(),
				user: session.user,
				config: session.config
			}
		};
	}
</script>

<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import type { User, Workflow, Config } from '$lib/types';
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
	import WorkflowList from './_WorkflowList.svelte';
	export let menu_has_form = false;
	export let workflows: Workflow[];
	export let user: User;
	export let config: Config;
	export let lastSearchCondition: string = '';
	export let form_status = { create: false, search: false, sort: false, import: false };
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	let urls = {
		search: `${API_SERVER}/workflow/search`
	};
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
	function sortBy(field: string, order: number) {
		config.sort = { field, order };
		workflows = workflows.sort((a, b): number => {
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
			workflows = res; //eslint-disable-line
			for (let i = 0; i < workflows.length; i++) {
				console.log(Date.parse(workflows[i].updatedAt));
			}
		}, 0);
		*/
	}
	const opWorkflow = (wfid: string, op: string): void => {
		setTimeout(async () => {
			let ret = await api.post('workflow/op', { wfid, op }, user.sessionToken);
			if (op === 'destroy') {
				workflows = workflows.filter((t: Workflow) => {
					return t.wfid !== wfid;
				});
			} else {
				for (let i = 0; i < workflows.length; i++) {
					if (workflows[i].wfid === wfid) {
						workflows[i].status = ret.status;
					}
				}
			}
		}, 1);
	};

	let files;
	let theSearchForm;
	let dataFile = null;
	let tplidImport;
</script>

<Container>
	<Row>
		<Col class="d-flex justify-content-center">
			<h1 class="text-xs-center">Workflows</h1>
		</Col>
	</Row>
</Container>
<div class="container kfk-menu" class:menu_has_form>
	<Container>
		<Row>
			<Col class="mt-1">
				<Nav>
					<NavLink
						class="kfk-link"
						on:click={() => {
							show_form('search');
						}}
					>
						<Icon name="search" />
						Search
					</NavLink>
				</Nav>
			</Col>
			<Col class="">
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
				{#if form_status.search}
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
									workflows = tmp;
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
				{/if}
			</Col>
		</Row>
	</Container>
</div>
<Container>
	<WorkflowList {workflows} {opWorkflow} />
</Container>
