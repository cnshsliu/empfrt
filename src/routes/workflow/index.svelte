<script context="module" lang="ts">
	let TimeTool = null;
	export async function load({ page, fetch, session }) {
		TimeTool = (await import('$lib/TimeTool')).default;
		return {
			props: {
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import * as Utils from '$lib/utils';
	import { API_SERVER } from '$lib/Env';
	import { onMount } from 'svelte';
	import { filterStore } from '$lib/empstores';
	import * as api from '$lib/api';
	import RemoteTable from './RemoteTable.svelte';
	import ExtraFilter from '$lib/form/ExtraFilter.svelte';
	import type { User } from '$lib/types';
	import { Button, Container, Row, Col } from 'sveltestrap';
	import { ClientPermControl } from '$lib/clientperm';
	export let menu_has_form = false;
	export let user: User;
	export let form_status = { create: false, search: false, sort: false, import: false };
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	$: token = user.sessionToken;
	let theExtraFilter: any;
	let filter_template;
	let theRemoteTable;
	let files;
	let theSearchForm;
	let tplidImport;
	let payload_extra = { filter: { status: '', tplid: '' } };

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

	function checkStore() {
		if (Utils.isBlank($filterStore.doer)) {
			$filterStore.doer = user.email;
		}
		if (Utils.isBlank($filterStore.wfStatus)) {
			$filterStore.wfStatus = 'ST_RUN';
		}
		if (Utils.isBlank($filterStore.workStatus)) {
			$filterStore.workStatus = 'ST_RUN';
		}
		if ($filterStore.workTitlePattern === undefined) {
			$filterStore.workTitlePattern = '';
		}
		if ($filterStore.wfTitlePattern === undefined) {
			$filterStore.wfTitlePattern = '';
		}
	}

	function refreshList() {
		checkStore();
		payload_extra.filter.status = $filterStore.wfStatus;

		payload_extra.filter.tplid = $filterStore.tplid;
		//payload_extra.doer = $filterStore.doer;
		theRemoteTable && theRemoteTable.refresh({ payload_extra });
	}

	let templates = [];
	onMount(async () => {
		let tmp = await api.post('template/tplid/list', {}, user.sessionToken);
		templates = tmp.map((x) => x.tplid);
		refreshList();
	});

	function filterStatusChanged(event) {
		$filterStore.wfStatus = event.detail;
		refreshList();
	}
</script>

<Container class="mt-1">
	<div class="d-flex">
		<div class="flex-shrink-0 fs-3">Processes</div>
		<div class="ms-5 align-self-center flex-grow-1">Instantiated workflow processes</div>
		<div class="justify-content-end flex-shrink-0">
			<Button
				on:click={() => {
					$filterStore.wfStatus = 'All';
					$filterStore.tplid = '';
					$filterStore.wfTitlePattern = '';
					theExtraFilter.reset();
					theRemoteTable.reset();
					refreshList();
				}}
				class="m-0 p-1"
			>
				Reset Query
			</Button>
		</div>
	</div>
</Container>
<Container class="mb-3">
	<svelte:component
		this={ExtraFilter}
		bind:this={theExtraFilter}
		{user}
		on:filterStatusChange={filterStatusChanged}
		on:filterTemplateChange={refreshList}
		statuses_label="Workflow status:"
		fields="{['statuses', 'templatepicker']},"
		object_type="processes"
		statuses={[
			{ value: 'All', label: 'All' },
			{ value: 'ST_RUN', label: 'Running' },
			{ value: 'ST_PAUSE', label: 'Paused' },
			{ value: 'ST_DONE', label: 'Finished' },
			{ value: 'ST_STOP', label: 'Stopped' }
		]}
		{templates}
	/>
	<Row class="mt-1">
		<Col>
			<RemoteTable
				endpoint="workflow/search"
				{token}
				{user}
				{payload_extra}
				bind:this={theRemoteTable}
				{TimeTool}
			/>
		</Col>
	</Row>
</Container>
