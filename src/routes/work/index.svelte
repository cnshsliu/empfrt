<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		const res = await fetch('/work/default.json');

		return {
			props: {
				works: await res.json(),
				user: session.user,
				config: session.config
			}
		};
	}
</script>

<script lang="ts">
	import type { User, Work } from '$lib/types';
	import { Container, Row, Col, Button } from 'sveltestrap';
	import { onMount } from 'svelte';
	import WorkPreview from './_WorkPreview.svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { title } from '$lib/title';

	export let works: Work[];
	export let user: User;
	export const lastSearchCondition: string = '';
	$title = 'HyperFlow';
	export let filter_doer = user.email;

	export let mouseover_objid: string = '';
	function setMouseOverObjid(objid: string) {
		mouseover_objid = objid;
	}
	function setMouseFocus() {}
	async function refreshList() {
		filter_doer = filter_doer === '' ? user.email : filter_doer;
		const res = await fetch(`/work/${filter_doer}.json`);
		works = await res.json();
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
				</Container>
			</form>
		</Col>
	</Row>
	<Row>
		<Col>
			{#if works.length === 0}
				<div class="article-preview">No templates are here... yet.</div>
			{:else}
				{#each works as work (work._id)}
					<div
						class="container kfk_template_list_item"
						transition:scale|local={{ start: 0.7 }}
						animate:flip={{ duration: 200 }}
						on:focus={() => setMouseFocus()}
						on:mouseover={() => setMouseOverObjid(work._id)}
					>
						<WorkPreview {work} {mouseover_objid} {user} />
					</div>
				{/each}
			{/if}
		</Col>
	</Row>
</Container>
