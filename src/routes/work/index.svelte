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
	import * as api from '$lib/api';
	import RemoteTable from './RemoteTable.svelte';
	import ExtraFilter from '$lib/form/ExtraFilter.svelte';
	import type { User, Work } from '$lib/types';
	import { session } from '$app/stores';
	import { Container, Row, Col, Button, FormGroup, Input } from 'sveltestrap';
	import { onMount } from 'svelte';
	import WorkPreview from './_WorkPreview.svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { title } from '$lib/title';
	import { WorkStatusStore } from '$lib/empStores';

	export let user: User;
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
	console.log(radioWorkStatus);
	//const jwt = auth && Buffer.from(auth.jwt, 'base64').toString('utf-8');

	//缺省情况下，使用用户邮箱，和ST_RUN
	let payload_extra = { doer: user.email, filter: { wfstatus: 'ST_RUN', status: 'ST_RUN' } };
	//当filter_doer或radioWorkStatus发生变化时，刷新RemoteTable
	$: {
		payload_extra = {
			doer: filter_doer === '' ? user.email : filter_doer,
			filter: filter_status !== 'All' ? { wfstatus: 'ST_RUN', status: filter_status } : undefined
		};

		remoteTable &&
			remoteTable.refresh({
				payload_extra
			});
	}

	function refreshList() {
		remoteTable &&
			remoteTable.refresh({
				payload_extra
			});
	}

	export let mouseover_objid: string = '';
	function setMouseOverObjid(objid: string) {
		mouseover_objid = objid;
	}
	function setMouseFocus() {}
	function radioChanged(e) {
		console.log(e.target.value);
		radioWorkStatus = e.target.value;
		$WorkStatusStore.status = radioWorkStatus;
	}

	onMount(() => {
		//refreshList();
		/* setTimeout(() => {
			refreshList();
		}, 2000); */
		/*
		const interval = setInterval(() => {
			refreshList();
		}, 2000);
		return () => clearInterval(interval);
		*/
		console.log(user);
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
</script>

<Container>
	<Row>
		<Col class="d-flex justify-content-center">
			<h1 class="text-xs-center">Work List</h1>
		</Col>
	</Row>
	<svelte:component
		this={ExtraFilter}
		bind:this={theExtraFilter}
		bind:filter_status
		bind:filter_doer
		fields="{['doer', 'statuses']},"
		statuses_label="Work status:"
		statuses={[
			{ value: 'All', label: 'All' },
			{ value: 'ST_RUN', label: 'Running' },
			{ value: 'ST_PAUSE', label: 'Paused' },
			{ value: 'ST_DONE', label: 'Finished' }
		]}
	/>
	<Row class="mt-3">
		<Col>
			<RemoteTable
				endpoint="work/list"
				{token}
				{input_search}
				{payload_extra}
				bind:this={remoteTable}
			/>
		</Col>
	</Row>
</Container>
