<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		const res = await fetch('/worklist.json');

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
	import * as api from '$lib/api';
	import { Container, Row, Col, Button } from 'sveltestrap';
	import WorkPreview from './_WorkPreview.svelte';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { title } from '$lib/title';

	import { enhance } from '$lib/form';
	export let works: Team[];
	export let user: User;
	export let config: Config;
	export let lastSearchCondition: string = '';
	$title = 'HyperFlow';

	export let mouseover_objid: string = '';
	function setMouseOverObjid(objid: string) {
		mouseover_objid = objid;
	}
	function setMouseFocus() {}
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
								aria-label="User Email"
								placeholder="Input user email to query his/her workitems"
								class="kfk-input-template-name"
							/>
						</Col>
						<Col>
							<Button size="sm" type="submit" color="primary">Query</Button>
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
						<WorkPreview {work} {mouseover_objid} />
					</div>
				{/each}
			{/if}
		</Col>
	</Row>
</Container>
