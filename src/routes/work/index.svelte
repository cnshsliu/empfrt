<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		//will use [doer].json.ts
		//const res = await fetch('/work/default.json');

		return {
			props: {
				//works: await res.json(),
				works: [],
				user: session.user,
				config: session.config
			}
		};
	}
</script>

<script lang="ts">
	import * as api from '$lib/api';
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
	export let filter_doer = user.email;

	//let work_status = get(WorkStatusStore);
	let work_status = $WorkStatusStore.status;
	let radioWorkStatus = work_status;
	console.log(radioWorkStatus);
	//const jwt = auth && Buffer.from(auth.jwt, 'base64').toString('utf-8');

	export let mouseover_objid: string = '';
	function setMouseOverObjid(objid: string) {
		mouseover_objid = objid;
	}
	function setMouseFocus() {}
	function radioChanged(e) {
		console.log(e.target.value);
		radioWorkStatus = e.target.value;
		refreshList();
		$WorkStatusStore.status = radioWorkStatus;
	}
	async function refreshList() {
		console.log('refreshList ', radioWorkStatus);
		works = await api.post(
			'work/list',
			{
				doer: filter_doer === '' ? user.email : filter_doer,
				filter:
					radioWorkStatus === 'All'
						? {}
						: radioWorkStatus === 'ST_RUN'
						? { status: 'ST_RUN', wfstatus: 'ST_RUN' }
						: radioWorkStatus === 'ST_PAUSE'
						? { status: 'ST_PAUSE' }
						: { status: 'ST_DONE' }
			},
			user.sessionToken
		);
	}

	onMount(() => {
		refreshList();
		const interval = setInterval(() => {
			refreshList();
		}, 2000);
		return () => clearInterval(interval);
	});
</script>

<Container>
	<Row>
		<Col class="d-flex justify-content-center">
			<h1 class="text-xs-center">Work List</h1>
		</Col>
	</Row>
	<Row>
		<Col>
			<form>
				<Container>
					<Row
						><Col>
							<input
								name="tplid"
								bind:value={filter_doer}
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
									refreshList();
								}}>Query</Button
							>
						</Col>
					</Row>
					<Row>
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
				</Container>
			</form>
		</Col>
	</Row>
	<Row>
		<Col>
			{#if works.length === 0}
				<div class="container">No works are here... yet.</div>
			{:else}
				{#each works as work (work._id)}
					<div
						class="container kfk_template_list_item"
						transition:scale|local={{ start: 0.7 }}
						animate:flip={{ duration: 200 }}
						on:focus={() => setMouseFocus()}
						on:mouseover={() => setMouseOverObjid(work._id)}
					>
						<WorkPreview {work} {mouseover_objid} />
					</div>
				{/each}
			{/if}
		</Col>
	</Row>
</Container>
