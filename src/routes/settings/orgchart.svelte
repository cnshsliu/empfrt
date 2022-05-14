<script context="module" lang="ts">
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from '$lib/i18n';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import { Row, Col, Container, Button } from 'sveltestrap';
	import BadgeWithDel from '$lib/input/BadgeWithDel.svelte';
	import OrgChartMaintainer from './orgchartMaintainer.svelte';
	import InputExandable from '$lib/input/InputExandable.svelte';
	import PDSResolver from '$lib/input/PDSResolver.svelte';
	import { setFadeMessage } from '$lib/Notifier';

	let orgchartlist = [];
	let orgchartroot = null;
	let posValue = '';
	let user = $session.user;
	let showOuId = true;

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
		ret = ret.filter((x) => x);
		ret = ret.map((x) => {
			x.level = level;
			x.number_of_children = 0;
			x.display = true;
			let tmp = x.position.filter((x) => x !== 'staff');
			x.position = tmp;
			if (x.uid === 'OU---') {
				x.icon = 'bi-caret-right-fill';
				x.expanded = false;
			} else {
				x.icon = 'bi-person-fill text-primary';
				x.expanded = false;
			}
			return x;
		});
		return ret;
	}

	async function toggleExpandOU(ou, level, ouIndex) {
		let indexInThisOU = 0;
		for (let i = 0; i < orgchartlist.length; i++) {
			if (orgchartlist[i].ou.startsWith(ou) === false) {
				continue;
			} else {
				if (indexInThisOU === 0) {
					orgchartlist[i].expanded = !orgchartlist[i].expanded;
					orgchartlist[i].icon = orgchartlist[i].expanded ? 'bi-caret-down' : 'bi-caret-right-fill';
					orgchartlist[i].display = true;
				} else {
					if (orgchartlist[ouIndex].expanded === false) {
						orgchartlist[i].display = false;
					} else {
						if (
							orgchartlist[i].ou.length === orgchartlist[ouIndex].ou.length ||
							(orgchartlist[i].uid === 'OU---' &&
								orgchartlist[i].ou.length === orgchartlist[ouIndex].ou.length + 5)
						) {
							orgchartlist[i].display = true;
						}
					}
				}
				indexInThisOU++;
			}
		}
		console.log('Childrens', indexInThisOU);
		if (indexInThisOU === 1) {
			let ret = await expandOrgChartFromServer(ou, level + 1);
			orgchartlist[ouIndex].number_of_children = ret.length;
			orgchartlist[ouIndex].display = true;
			orgchartlist[ouIndex].expanded = true;
			for (let i = 0; i < ret.length; i++) {
				ret[i].dispaly = true;
				ret[i].expanded = false;
			}
			orgchartlist.splice(ouIndex + 1, 0, ...ret);
		}
		orgchartlist = orgchartlist;
	}

	let resolver_label = '';

	onMount(async () => {
		resolver_label = $_('setting.orgchart.resolver_label');
		await refreshOrgChart();
	});

	const refreshOrgChart = async () => {
		let tmp = await expandOrgChartFromServer('root', 0, true);
		orgchartroot = tmp[0];
		orgchartlist = tmp.splice(1);
	};

	let authorizedAdmin = false;

	api.post('orgchart/authorized/admin', {}, user.sessionToken).then((res) => {
		authorizedAdmin = res as unknown as boolean;
	});
</script>

<form>
	<Container class="mt-3 mb-3 text-nowrap">
		<Row>
			<nav aria-label="breadcrumb">
				<ol class="breadcrumb">
					<li class="breadcrumb-item kfk-tag">
						<a
							class="kfk-link"
							href={'#'}
							on:click={() => {
								goto('/settings');
							}}>
							{$_('navmenu.settings')}
						</a>
					</li>
					<li class="breadcrumb-item active kfk-tag" aria-current="page">
						<a
							class="kfk-link"
							href={'#'}
							on:click={() => {
								goto('/settings/tenant');
							}}>
							{$_('setting.tenant.nav')}
						</a>
					</li>
					<li class="breadcrumb-item active" aria-current="page">
						{$_('setting.orgchart.nav')}
					</li>
					<li class="breadcrumb-item active kfk-tag" aria-current="page">
						<a
							class="kfk-link"
							href={'#'}
							on:click={() => {
								goto('/settings/members');
							}}>
							{$_('setting.members.nav')}
						</a>
					</li>
					<li class="breadcrumb-item active kfk-tag" aria-current="page">
						<a
							class="kfk-link"
							href={'#'}
							on:click={() => {
								goto('/settings/resign');
							}}>
							{$_('setting.resign.nav')}
						</a>
					</li>
				</ol>
			</nav>
		</Row>
		{#if orgchartroot && orgchartroot.ou === 'root'}
			{orgchartroot.cn}
			<Button on:click={refreshOrgChart} color="primary">
				{$_('setting.orgchart.btn.refresh')}
			</Button>
			{#each orgchartlist as oce, index (oce)}
				{#if oce.display === true}
					<Row>
						<Col class="kfk-tag">
							{#if oce.uid === 'OU---'}
								<div
									class="clickable kfk-link"
									style={`padding-left:${20 * oce.level}px;`}
									on:click={(e) => {
										e.preventDefault();
										toggleExpandOU(oce.ou, oce.level, index);
									}}>
									<i class={oce.icon} />
									<!--[E: {oce.expanded} D:{oce.display}]-->
									{oce.cn}
									{oce.number_of_children ? `[${oce.number_of_children}]` : ''}
									{showOuId ? oce.ou : ''}
								</div>
							{:else}
								<div style={`padding-left:${20 * oce.level}px;`}>
									<i class={oce.icon} color="primary" />
									<!-- [E: {oce.expanded} D:{oce.display}] -->
									{oce.cn}
									({oce.uid})
									{#if oce.position && Array.isArray(oce.position)}
										{#each oce.position as aPos}
											<BadgeWithDel
												bind:text={aPos}
												withDeleteButton={authorizedAdmin}
												on:delete={async (e) => {
													let res = await api.post(
														'orgchart/delpos',
														{ ocid: oce._id, pos: aPos },
														user.sessionToken,
													);
													if (res.error) {
														setFadeMessage(res.message, 'warning');
													} else {
														oce.position = res.position;
													}
												}} />
										{/each}
									{/if}
									{#if authorizedAdmin}
										<InputExandable
											bind:value={posValue}
											on:input={async (e) => {
												let res = await api.post(
													'orgchart/addpos',
													{ ocid: oce._id, pos: e.detail },
													user.sessionToken,
												);
												if (res.error) {
													setFadeMessage(res.message, 'warning');
												} else {
													oce.position = res.position.filter((x) => x !== 'staff');
													setFadeMessage('Success', 'success');
												}
											}} />
									{/if}
								</div>
							{/if}
						</Col>
					</Row>
				{/if}
			{/each}
		{/if}
	</Container>
</form>
<Container>
	<PDSResolver class="mt-3" bind:label={resolver_label} embed={true} />
	<div>{$_('setting.orgchart.comment')}</div>
</Container>

{#if authorizedAdmin}
	<div>
		<OrgChartMaintainer />
	</div>
{/if}

<style>
	ul li {
		list-style-type: none;
	}
</style>
