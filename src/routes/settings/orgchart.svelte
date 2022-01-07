<script lang="ts">
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import { Container, Icon } from 'sveltestrap';
	let orgchartlist = [];
	let orgchartroot = null;
	export let user;
	export let showOuId;
	function findOu(ocl, ouId) {
		let ret = null;
		for (let i = 0; i < ocl.length; i++) {
			if (ocl[i].ou === ouId && ocl[i].uid === `OU-${ouId}`) {
				ret = ocl[i];
			}
		}
		return ret;
	}
	function findStaffUnderOu(ocl, ouId) {
		let ret = [];
		for (let i = 0; i < ocl.length; i++) {
			if (ocl[i].ou === ouId && ocl[i].uid.startsWith('OU-') === false) {
				ret.push(ocl[i]);
			}
		}
		return ret;
	}
	function findOuUnderOu(ocl, ouId) {
		let ret = [];
		for (let i = 0; i < ocl.length; i++) {
			if (
				ocl[i].uid.startsWith('OU-') &&
				((ouId === 'root' && ocl[i].ou.length === 5) ||
					(ocl[i].ou.indexOf(ouId) === 0 && ocl[i].ou.length === ouId.length + 5))
			) {
				ret.push(ocl[i]);
			}
		}
		return ret;
	}
	async function expandOrgChartFromServer(ou, level, include = false) {
		let ret = await api.post('orgchart/expand', { ou: ou, include: include }, user.sessionToken);
		ret = ret.map((x) => {
			x.level = level;
			x.number_of_children = 0;
			x.display = 'block';
			let tmp = x.position.filter((x) => x !== 'staff');
			x.position = tmp.join(',');
			if (x.uid === 'OU---') x.icon = 'bi-caret-right-fill';
			else x.icon = 'bi-person-fill text-primary';
			return x;
		});
		return ret;
	}
	async function expandOu(ou, level, index) {
		let tmp = orgchartlist.filter((x) => x.ou.startsWith(ou));
		if (tmp.length > 1) {
			tmp[0].icon = tmp[0].icon === 'bi-caret-right-fill' ? 'bi-caret-down' : 'bi-caret-right-fill';
			for (let i = 1; i < tmp.length; i++) {
				tmp[i].display = tmp[i].display === 'block' ? 'none' : 'block';
			}
		} else {
			let ret = await expandOrgChartFromServer(ou, level + 1);
			orgchartlist[index].number_of_children = ret.length;
			orgchartlist[index].icon = 'bi-caret-down';
			orgchartlist[index].display = 'block';
			orgchartlist.splice(index + 1, 0, ...ret);
		}
		orgchartlist = orgchartlist;
	}
	onMount(async () => {
		let tmp = await expandOrgChartFromServer('root', 0, true);
		orgchartroot = tmp[0];
		orgchartlist = tmp.splice(1);
	});
</script>

<Container class="text-nowrap">
	{#if orgchartroot && orgchartroot.ou === 'root'}
		{orgchartroot.cn}
		<ul>
			{#each orgchartlist as oce, index (oce)}
				<li style={`display:${oce.display}`}>
					{#if oce.uid === 'OU---'}
						<span
							style={`padding-left:${20 * oce.level}px;`}
							on:click={() => {
								expandOu(oce.ou, oce.level, index);
							}}
						>
							<i class={oce.icon} />
							{oce.cn}
							{oce.number_of_children ? `[${oce.number_of_children}]` : ''}
							{showOuId ? oce.ou : ''}
						</span>
					{:else}
						<span style={`padding-left:${20 * oce.level}px;`}>
							<i class={oce.icon} color="primary" />
							{oce.position ? `[${oce.position}]` : ''}
							{oce.cn} ({oce.uid})
						</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</Container>

<style>
	ul li {
		list-style-type: none;
	}
</style>
