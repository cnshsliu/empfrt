<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		return {
			props: {
				works: [],
				user: session.user,
				config: session.config
			}
		};
	}
</script>

<script lang="ts">
	import * as api from '$lib/api';
	import RemoteTable from './RemoteTable.svelte';
	import type { User, Work } from '$lib/types';
	import { Container, Row, Col, Button, FormGroup, Input } from 'sveltestrap';
	import { onMount } from 'svelte';
	import WorkPreview from './_WorkPreview.svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { title } from '$lib/title';
	import { WorkStatusStore } from '$lib/empStores';

	export let works: Work[];
	export let user: User;
	export const lastSearchCondition: string = '';
	$title = 'HyperFlow';
	$: token = user.sessionToken;
	let remoteTable;
	export let filter_doer = user.email;
	let input_doer;

	let doer = user.email;

	//let work_status = get(WorkStatusStore);
	let work_status = $WorkStatusStore.status ? $WorkStatusStore.status : 'ST_RUN';
	let radioWorkStatus = work_status;
	console.log(radioWorkStatus);
	//const jwt = auth && Buffer.from(auth.jwt, 'base64').toString('utf-8');

	//缺省情况下，使用用户邮箱，和ST_RUN
	let payload_extra = { doer: user.email, filter: { status: 'ST_RUN' } };
	//当filter_doer或radioWorkStatus发生变化时，刷新RemoteTable
	$: {
		payload_extra = {
			doer: filter_doer === '' ? user.email : filter_doer,
			filter: radioWorkStatus !== 'All' ? { status: radioWorkStatus } : undefined
		};

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
		/*
		const interval = setInterval(() => {
			refreshList();
		}, 2000);
		return () => clearInterval(interval);
		*/
	});
</script>

<Container>
	<Row>
		<Col class="d-flex justify-content-center">
			<h1 class="text-xs-center">Work List</h1>
		</Col>
	</Row>
	<form>
		<Row>
			<Col>
				<input
					name="tplid"
					bind:value={input_doer}
					aria-label="User Email"
					placeholder="Input user email to query his/her workitems"
					class="kfk-input-template-name"
				/>
			</Col>
			<Col>
				<Button
					size="sm"
					type="submit"
					color="primary"
					on:click={(e) => {
						e.preventDefault();
						filter_doer = input_doer;
					}}>Change User</Button
				>
			</Col>
		</Row>
		<Row>
			<Col xs="auto">Work Status:</Col>
			<Col xs="auto">
				<Input
					id="r1"
					type="radio"
					bind:group={radioWorkStatus}
					value="All"
					label="All"
					on:input={(e) => radioChanged(e)}
				/>
			</Col>
			<Col xs="auto">
				<Input
					id="r2"
					type="radio"
					bind:group={radioWorkStatus}
					value="ST_RUN"
					label="Running"
					on:input={(e) => radioChanged(e)}
				/>
			</Col>
			<Col xs="auto">
				<Input
					id="r3"
					type="radio"
					bind:group={radioWorkStatus}
					value="ST_PAUSE"
					label="Paused"
					on:input={(e) => radioChanged(e)}
				/>
			</Col>
			<Col xs="auto">
				<Input
					id="r3"
					type="radio"
					bind:group={radioWorkStatus}
					value="ST_DONE"
					label="Done"
					on:input={(e) => radioChanged(e)}
				/>
			</Col>
		</Row>
	</form>
	<Row class="mt-3">
		<Col>
			<RemoteTable endpoint="work/list" {token} {payload_extra} bind:this={remoteTable} />
		</Col>
	</Row>
</Container>
