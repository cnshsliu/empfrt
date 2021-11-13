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
	import { onMount } from 'svelte';
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
	let payload_extra = { filter: { status: 'ST_RUN' } };

	function reload(status = 'ST_RUN') {
		if (status === undefined) {
			status = 'ST_RUN';
		}
		payload_extra = {
			filter: status !== 'All' ? { status: status } : undefined
		};

		remoteTable && remoteTable.refresh({ payload_extra });
	}

	onMount(() => {
		reload();
	});

	function filterStatusChanged(event) {
		reload(event.detail);
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
		<div class="flex-shrink-0">
			<h1>Processes</h1>
		</div>
		<div class="mx-5 align-self-center flex-grow-1">Instantiated workflow processes</div>
	</div>
</Container>
<Container class="mb-3">
	<svelte:component
		this={ExtraFilter}
		bind:this={theExtraFilter}
		on:filterStatusChange={filterStatusChanged}
		filter_status={'ST_RUN'}
		statuses_label="Workflow status:"
		fields="{['statuses']},"
		object_type="processes"
		statuses={[
			{ value: 'All', label: 'All' },
			{ value: 'ST_RUN', label: 'Running' },
			{ value: 'ST_PAUSE', label: 'Paused' },
			{ value: 'ST_DONE', label: 'Finished' },
			{ value: 'ST_STOP', label: 'Stopped' }
		]}
	/>
	<Row class="mt-3">
		<Col>
			<RemoteTable endpoint="workflow/search" {token} {user} bind:this={remoteTable} />
		</Col>
	</Row>
</Container>
