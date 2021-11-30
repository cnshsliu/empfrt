<script context="module" lang="ts">
	import { post } from '$lib/utils';
	import lodash from 'lodash';
	export async function load({ page, fetch, session }) {
		let iframeMode = false;
		if (page.query.has('iframe')) {
			iframeMode = true;
		}
		let delegators = [];
		try {
			let delegations = await post('/delegation/today');
			delegators = delegations.map((x) => x.delegator);
			if (delegators.includes(session.user.email) === false) {
				delegators.push(session.user.email);
			}
			delegators = lodash.uniq(delegators);
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
	import type { User, Work } from '$lib/types';
	import { get } from 'svelte/store';
	import type { WhichTab } from '$lib/types';
	import { whichTabStore } from '$lib/empstores';
	import { session } from '$app/stores';
	import { Container, Row, Col, Button, FormGroup, Input } from 'sveltestrap';
	import { onMount } from 'svelte';
	import WorkPreview from './_WorkPreview.svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { title } from '$lib/title';
	import { WorkStatusStore } from '$lib/empStores';

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
	let input_doer;
	let input_search;

	let doer = user.email;

	//let work_status = get(WorkStatusStore);
	let work_status = $WorkStatusStore.status ? $WorkStatusStore.status : 'ST_RUN';
	let radioWorkStatus = work_status;
	//const jwt = auth && Buffer.from(auth.jwt, 'base64').toString('utf-8');

	//缺省情况下，使用用户邮箱，和ST_RUN
	let payload_extra = {
		doer: user.email,
		filter: { wfstatus: 'ST_RUN', status: 'ST_RUN', tplid: '' }
	};

	function refreshList() {
		if (payload_extra.filter.tplid === '') delete payload_extra.filter.tplid;
		if (payload_extra.filter.status === 'All') delete payload_extra.filter.status;
		remoteTable &&
			remoteTable.refresh({
				payload_extra
			});
	}

	export let mouseover_objid: string = '';
	function radioChanged(e) {
		radioWorkStatus = e.target.value;
		$WorkStatusStore.status = radioWorkStatus;
	}

	let templates = [];
	onMount(() => {
		//refreshList();
		/* setTimeout(() => {
		}, 2000); */
		refreshList();
		/*
		const interval = setInterval(() => {
			refreshList();
		}, 2000);
		return () => clearInterval(interval);
		*/
		templates = ['mailer', '铂爵会电脑采购', 'tones_load'];
		if (user.extra && user.extra.input_search && user.extra.input_search.startsWith('wf:')) {
			input_search = user.extra.input_search;
		}
		if (user.extra && user.extra.filter_status) {
			filter_status = user.extra.filter_status;
		}
		if (user.extra) {
			user.extra = undefined;
			$session.user = user;
		}
	});
	function filterStatusChanged(event) {
		let status = event.detail;
		if (status !== 'ALL') {
			payload_extra.filter.status = status;
			if (payload_extra.filter.tplid === '') delete payload_extra.filter.tplid;
			if (payload_extra.filter.status === 'All') delete payload_extra.filter.status;
			remoteTable && remoteTable.refresh({ payload_extra });
		}
	}
	function filterTemplateChanged(event) {
		let tplid = event.detail;
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
			of {payload_extra.doer}
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
			/>
		</Col>
	</Row>
</Container>
