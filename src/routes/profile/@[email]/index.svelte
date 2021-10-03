<script context="module" lang="ts">
	import { create_load } from './_load';
	export const load = create_load('works');
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import { Container, Nav, NavLink, Icon } from 'sveltestrap';
	import type { Work } from '$lib/types';
	import * as api from '$lib/api';
	export let works: Work[];
	let mouseover_objid = '';
	function setMouseOverObjid(objid) {
		console.log(objid);
		mouseover_objid = objid;
	}
	async function refreshWorks(status) {
		works = await api.post(
			'work/list',
			{ doer: $session.user.email, filter: status ? { status } : {} },
			$session.user.sessionToken
		);
	}
</script>

<h1>My Works</h1>
<Nav>
	<NavLink
		class="kfk-link"
		on:click={() => {
			refreshWorks();
		}}
	>
		All
	</NavLink>
	<NavLink
		class="kfk-link"
		on:click={() => {
			refreshWorks('ST_RUN');
		}}
	>
		Running
	</NavLink>
	<NavLink
		class="kfk-link"
		on:click={() => {
			refreshWorks('ST_DONE');
		}}
	>
		Done
	</NavLink>
</Nav>
{#each works as work}
	<div
		class={mouseover_objid === work.workid ? 'kfk-highlight-2' : ''}
		on:mouseover={() => setMouseOverObjid(work.workid)}
	>
		<Container>
			<b>
				{work.title}
			</b>
			in {work.wftitle}
			{work.status}
			{#if mouseover_objid === work.workid}
				Button
			{/if}
		</Container>
	</div>
{/each}
