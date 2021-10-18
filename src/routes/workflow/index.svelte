<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		let res;
		let tplid = page.query.get('tplid');
		res = await fetch(`/workflow/index-${tplid}.json`);
		return {
			props: {
				theTplid: tplid,
				workflows: await res.json(),
				user: session.user,
				config: session.config
			}
		};
	}
</script>

<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import RemoteTable from './RemoteTable.svelte';
	import type { User, Workflow, Config } from '$lib/types';
	import { goto } from '$app/navigation';
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
	export let theTplid;
	export let workflows: Workflow[];
	export let user: User;
	export let config: Config;
	export let lastSearchCondition: string = '';
	export let form_status = { create: false, search: false, sort: false, import: false };
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	$: token = user.sessionToken;
	let remoteTable;
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
	}

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
<Container class="mb-3">
	<Row class="mt-3">
		<Col>
			<RemoteTable endpoint="workflow/search" {token} bind:this={remoteTable} />
		</Col>
	</Row>
</Container>
