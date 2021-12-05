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
	import { API_SERVER } from '$lib/Env';
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import RemoteTable from './RemoteTable.svelte';
	import ExtraFilter from '$lib/form/ExtraFilter.svelte';
	import type { User } from '$lib/types';
	import { Fade, Card, Container, Row, Col } from 'sveltestrap';
	import { ClientPermControl } from '$lib/clientperm';
	import Parser from '$lib/parser';
	export let menu_has_form = false;
	export let user: User;
	export let form_status = { create: false, search: false, sort: false, import: false };
	import { title } from '$lib/title';
	$title = 'HyperFlow';
	$: token = user.sessionToken;
	let theExtraFilter: any;
	let filter_status;
	let filter_template;
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

	let files;
	let theSearchForm;
	let dataFile = null;
	let tplidImport;
	let after_mount = false;
	let payload_extra = { filter: { status: '', tplid: '' } };

	function reload(status = 'ST_RUN') {
		reloadOnFilterStatusChange('ST_RUN');
	}
	function reloadOnFilterStatusChange(status = 'ST_RUN') {
		if (status === undefined) {
			status = 'ST_RUN';
		}
		payload_extra.filter.status = status;

		if (payload_extra.filter.tplid === '') delete payload_extra.filter.tplid;
		if (payload_extra.filter.status === 'All') delete payload_extra.filter.status;
		remoteTable && remoteTable.refresh({ payload_extra });
	}

	let templates = [];
	onMount(async () => {
		let tmp = await api.post('template/tplid/list', {}, user.sessionToken);
		templates = tmp.map((x) => x.tplid);
		reload();
	});

	function filterStatusChanged(event) {
		reloadOnFilterStatusChange(event.detail);
	}
	function filterTemplateChanged(event) {
		let tplid = event.detail;
		payload_extra.filter.tplid = tplid;
		if (payload_extra.filter.tplid === '') delete payload_extra.filter.tplid;
		if (payload_extra.filter.status === 'All') delete payload_extra.filter.status;
		remoteTable && remoteTable.refresh({ payload_extra });
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
		<div class="flex-shrink-0 fs-3">Processes</div>
		<div class="mx-5 align-self-center flex-grow-1">Instantiated workflow processes</div>
	</div>
</Container>
<Container class="mb-3">
	<svelte:component
		this={ExtraFilter}
		bind:this={theExtraFilter}
		on:filterStatusChange={filterStatusChanged}
		on:filterTemplateChange={filterTemplateChanged}
		filter_status={'ST_RUN'}
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
			<RemoteTable endpoint="workflow/search" {token} {user} bind:this={remoteTable} {TimeTool} />
		</Col>
	</Row>
</Container>
