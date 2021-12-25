<script context="module" lang="ts">
	import * as Utils from '$lib/utils';
	let TimeTool = null;
	export async function load({ page, session }) {
		TimeTool = (await import('$lib/TimeTool')).default;
		let iframeMode = false;
		if (page.query.has('iframe')) {
			iframeMode = true;
		}
		let delegators = [];
		try {
			let delegations = (await Utils.post('/delegation/today')) as any;
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
	import { filterStore } from '$lib/empstores';

	export let user: User;
	export let iframeMode;
	export let delegators;
	export const lastSearchCondition: string = '';
	$title = 'HyperFlow';
	$: token = user.sessionToken;
	let theRemoteTable;
	let theExtraFilter: any;
	let input_doer;
	let templates = [];

	//缺省情况下，使用用户邮箱，和ST_RUN
	let payload_extra = {
		doer: user.email,
		filter: { status: 'ST_RUN', tplid: '' }
	};

	//const jwt = auth && Buffer.from(auth.jwt, 'base64').toString('utf-8');

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
		payload_extra.filter.status = $filterStore.workStatus;
		payload_extra.filter.tplid = $filterStore.tplid;
		payload_extra.doer = $filterStore.doer;
		theRemoteTable &&
			theRemoteTable.refresh({
				payload_extra
			});
	}
	function filterStatusChanged(event) {
		$filterStore.workStatus = event.detail;
		refreshList();
	}

	onMount(async () => {
		if ($filterStore.gotoUID) {
			$filterStore.doer = $filterStore.gotoUID + user.email.substring(user.email.indexOf('@'));
			$filterStore.gotoUID = undefined;
		}
		refreshList();

		let tmp = await api.post('template/tplid/list', {}, user.sessionToken);

		templates = tmp.map((x) => x.tplid);
	});
</script>

<Container class="mt-1">
	<div class="d-flex">
		<div class="flex-shrink-0 fs-3">Work list</div>
		<div class="ms-5 align-self-center flex-grow-1">
			of <span class="fs-4 text-dark">{payload_extra.doer}</span>
		</div>
		<div class="justify-content-end flex-shrink-0">
			<Button
				on:click={() => {
					$filterStore.workStatus = 'All';
					$filterStore.tplid = '';
					$filterStore.doer = user.email;
					$filterStore.workTitlePattern = '';
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
<Container>
	<svelte:component
		this={ExtraFilter}
		bind:this={theExtraFilter}
		{user}
		{delegators}
		on:filterDoerChange={refreshList}
		on:filterStatusChange={filterStatusChanged}
		on:filterTemplateChange={refreshList}
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
				{payload_extra}
				bind:this={theRemoteTable}
				{TimeTool}
			/>
		</Col>
	</Row>
</Container>
