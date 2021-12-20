<script context="module" lang="ts">
	import { post } from '$lib/utils';
	let TimeTool = null;
	export async function load({ page, session }) {
		TimeTool = (await import('$lib/TimeTool')).default;
		let iframeMode = false;
		if (page.query.has('iframe')) {
			iframeMode = true;
		}
		let delegators = [];
		try {
			let delegations = (await post('/delegation/today')) as any;
			delegators = delegations.map((x: any) => x.delegator);
			if (delegators.includes(session.user.email) === false) {
				delegators.push(session.user.email);
			}
		} catch (e) {}
		return {
			props: {
				user: session.user,
				iframeMode: iframeMode,
				delegators: delegators
			}
		};
	}
</script>

<script lang="ts">
	import RemoteTable from './RemoteTable.svelte';
	import ExtraFilter from '$lib/form/ExtraFilter.svelte';
	import * as api from '$lib/api';
	import type { User, Work } from '$lib/types';
	import { session } from '$app/stores';
	import { Container, Row, Col, Button, FormGroup, Input } from 'sveltestrap';
	import { onMount } from 'svelte';
	import { title } from '$lib/title';
	import { WorkStatusStore } from '$lib/empstores';

	export let user: User;
	export let iframeMode;
	export let delegators;
	export const lastSearchCondition: string = '';
	$title = 'HyperFlow';
	$: token = user.sessionToken;
	let remoteTable;
	let theExtraFilter: any;
	export let filter_doer = user.email;
	let filter_status = 'ST_RUN';
	let filter_template;
	let input_doer;
	let input_search;

	let doer = user.email;
	//缺省情况下，使用用户邮箱，和ST_RUN
	let payload_extra = {
		doer: user.email,
		filter: { wfstatus: 'ST_RUN', status: 'ST_RUN', tplid: '' }
	};

	//let work_status = get(WorkStatusStore);
	let work_status = $WorkStatusStore.status ? $WorkStatusStore.status : 'ST_RUN';
	let radioWorkStatus = work_status;
	//const jwt = auth && Buffer.from(auth.jwt, 'base64').toString('utf-8');

	function refreshList() {
		if (payload_extra.filter.tplid === '') delete payload_extra.filter.tplid;
		if (payload_extra.filter.status === 'All') delete payload_extra.filter.status;
		remoteTable &&
			remoteTable.refresh({
				payload_extra
			});
	}

	function radioChanged(e) {
		radioWorkStatus = e.target.value;
		$WorkStatusStore.status = radioWorkStatus;
	}

	let templates = [];
	onMount(async () => {
		if ($session.filter_template) {
			payload_extra.filter.tplid = $session.filter_template;
			filter_template = payload_extra.filter.tplid;
		}
		// Every page load, read fitler_status from $session
		filter_status = $session.worklist_extraFilterStatus;
		//Set filte_status for ExtraFilter use
		if (!filter_status) filter_status = 'ST_RUN';
		//Set filte_status for RemoteTable use
		if (filter_status === 'All') delete payload_extra.filter.status;
		else payload_extra.filter.status = filter_status;
		refreshList();

		let tmp = await api.post('template/tplid/list', {}, user.sessionToken);

		templates = tmp.map((x) => x.tplid);
		if (user.extra && user.extra.input_search && user.extra.input_search.startsWith('wf:')) {
			input_search = user.extra.input_search;
		}
		if ($session.gotoUser) {
			filter_doer = $session.gotoUser + user.email.substring(user.email.indexOf('@'));
			filterDoerChanged(null);
			$session.gotoUser = undefined;
		}
		console.log('>>>>  ', filter_template);
	});
	function filterStatusChanged(event) {
		let status = event.detail;
		$session.worklist_extraFilterStatus = event.detail;
		filter_status = event.detail;
		if (status !== 'ALL') {
			payload_extra.filter.status = status;
			if (payload_extra.filter.tplid === '') delete payload_extra.filter.tplid;
			if (payload_extra.filter.status === 'All') delete payload_extra.filter.status;
			remoteTable && remoteTable.refresh({ payload_extra });
		}
	}
	function filterTemplateChanged(event) {
		let tplid = event.detail;
		$session.filter_template = tplid;
		payload_extra.filter.tplid = tplid;
		if (payload_extra.filter.tplid === '') delete payload_extra.filter.tplid;
		if (payload_extra.filter.status === 'All') delete payload_extra.filter.status;
		remoteTable && remoteTable.refresh({ payload_extra });
	}
	function filterDoerChanged(event) {
		if (payload_extra.doer !== filter_doer) {
			payload_extra.doer = filter_doer;
			remoteTable && remoteTable.refresh({ payload_extra });
		}
	}
</script>

<Container>
	<div class="d-flex">
		<div class="flex-shrink-0 fs-3">Work list</div>
		<div class="mx-5 align-self-center flex-grow-1">
			of <span class="fs-4 text-dark">{payload_extra.doer}</span>
		</div>
	</div>
</Container>
<Container>
	<svelte:component
		this={ExtraFilter}
		bind:this={theExtraFilter}
		bind:filter_status
		bind:filter_doer
		bind:user
		bind:delegators
		{filter_template}
		on:filterDoerChange={filterDoerChanged}
		on:filterStatusChange={filterStatusChanged}
		on:filterTemplateChange={filterTemplateChanged}
		fields="{['doer', 'templatepicker', 'statuses']},"
		object_type="work items"
		statuses_label="Work status:"
		statuses={[
			{ value: 'All', label: 'All' },
			{ value: 'ST_RUN', label: 'Running' },
			{ value: 'ST_PAUSE', label: 'Paused' },
			{ value: 'ST_DONE', label: 'Finished' }
		]}
		{templates}
	/>
	<Row class="mt-3">
		<Col>
			<RemoteTable
				endpoint="work/list"
				{token}
				{iframeMode}
				{input_search}
				{payload_extra}
				bind:this={remoteTable}
				{TimeTool}
			/>
		</Col>
	</Row>
</Container>
