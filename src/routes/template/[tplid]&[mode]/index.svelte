<script context="module" lang="ts">
	export async function load({ url, params, fetch, session }) {
		let tpl_mode = params.mode;
		let tplid = params.tplid;
		if (tplid && tplid.charAt(0) === '@') tplid = tplid.substring(1);
		const jsonUrl = `/template/${tplid}&${tpl_mode}.json`;
		try {
			const res = await fetch(jsonUrl);
			const resJson = await res.json();
			return {
				props: {
					template: resJson,
					tplid: tplid,
					tpl_mode,
					user: session.user
				}
			};
		} catch (err) {
			console.error(err);
			return {
				props: {
					template: { tplid: 'Not Found' },
					tplid: tplid,
					tpl_mode,
					user: session.user
				}
			};
		}
	}
</script>

<script lang="ts">
	import { _ } from '$lib/i18n';
	import { API_SERVER } from '$lib/Env';
	import type { User, Template, Team } from '$lib/types';
	import ErrorNotify from '$lib/ErrorNotify.svelte';
	import AniIcon from '$lib/AniIcon.svelte';
	import { filterStorage } from '$lib/empstores';
	import { setFadeMessage } from '$lib/Notifier';
	import type { oneArgFunc } from '$lib/types';
	import { ClientPermControl } from '$lib/clientperm';
	import Parser from '$lib/parser';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { title } from '$lib/title';
	import * as api from '$lib/api';
	import { Row, Col, Nav, NavLink, Input } from 'sveltestrap';
	import { Icon, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
	import { onMount } from 'svelte';
	import { enhance } from '$lib/form';
	export let tplid;
	export let template: Template;
	export let tpl_mode: string;

	$title = template.tplid;
	let Designer: any;
	let theDesigner: any;
	let readonly = tpl_mode !== 'edit';
	let recentTemplates = [];
	let recentTeams = [];
	let showNodeId = false;
	let newTplId = '';
	let oldTplId = '';

	const saveOneRecentTemplate = function (tplid) {
		if (tplid === null || tplid === undefined || tplid === '') return;
		let tmp = recentTemplates.indexOf(tplid);
		if (tmp > -1) {
			recentTemplates.splice(tmp, 1);
		}
		recentTemplates.unshift(tplid);
		if (recentTemplates.length > 10) {
			recentTemplates.splice(10);
		}
		localStorage.setItem('recentTemplates', JSON.stringify(recentTemplates));
		recentTemplates = recentTemplates;
	};

	onMount(async () => {
		const module = await import('$lib/designer/Designer.svelte');
		Designer = module.default;
		//$filterStorage.tplid = tplid;
		$filterStorage.workTitlePattern = '';
		if (localStorage) {
			recentTemplates = JSON.parse(localStorage.getItem('recentTemplates') ?? JSON.stringify([]));
			recentTeams = JSON.parse(localStorage.getItem('recentTeams') ?? JSON.stringify([]));
			saveOneRecentTemplate(tplid);
		}
	});

	let urls = {
		create: `${API_SERVER}/template/create`,
		rename: `${API_SERVER}/template/rename`,
		copyto: `${API_SERVER}/template/copyto`
	};

	export let form_status = {
		create: false,
		search: false,
		sort: false,
		export: false,
		rename: false,
		copyto: false,
		delete: false,
		start: false
	};
	export let form_name = '';
	export let export_to_filename = template.tplid;
	export let user: User;

	$: topmenu_class = form_name === '' ? '' : 'whiteback';
	function hide_all_form() {
		Object.keys(form_status).forEach((key) => {
			form_status[key] = false;
		});
		form_name = '';
		theDesigner.documentEventOn();
	}
	function show_form(what: string) {
		hide_all_form();
		form_status[what] = true;
		form_name = what;
		theDesigner.documentEventOff();
	}
	async function change_mode(what: string) {
		tpl_mode = what;
		readonly = tpl_mode === 'read';
		goto(`/template/${template.tplid}&${tpl_mode}`, {
			replaceState: true,
			noscroll: true,
			keepfocus: true
		});
		await theDesigner.changeViewMode(tpl_mode);
	}
	async function startIt() {
		goto(`/template/${template.tplid}&${tpl_mode}`, {
			replaceState: true,
			noscroll: true,
			keepfocus: true
		});
		await theDesigner.changeViewMode(tpl_mode);
	}
	//$: readonly = tpl_mode === 'read';
	function show_delete_template_modal() {
		hide_all_form();
	}
	function delete_template() {
		hide_all_form();
		setTimeout(async () => {
			let ret = await api.post(
				'template/delete/byname',
				{ tplid: template.tplid },
				user.sessionToken
			);
			goto('/template', { replaceState: false });
		}, 1);
	}

	function removeElementsByClass(className) {
		const elements = document.getElementsByClassName(className);
		while (elements.length > 0) {
			elements[0].parentNode.removeChild(elements[0]);
		}
	}

	function export_template() {
		if (export_to_filename.endsWith('.xml'))
			export_to_filename = export_to_filename.substring(0, export_to_filename.lastIndexOf('.xml'));
		api.post('template/download', { tplid: template.tplid }, user.sessionToken).then((response) => {
			const url = window.URL.createObjectURL(new Blob([response as unknown as BlobPart]));
			removeElementsByClass('tempLink');
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `${export_to_filename}.xml`); //or any other extension
			link.setAttribute('class', 'tempLink');
			document.body.appendChild(link);
			//点击这个临时连接实现内容下载
			link.click();
			hide_all_form();
		});
	}

	async function viewInstanceTemplate(wfid: string) {
		let payload = { wfid: wfid };
		let ret = await api.post('workflow/dump/instemplate', payload, user.sessionToken);
		goto(`/template/${wfid}_instemplate&read`);
		$title = wfid + '_instemplate';
		return;
	}

	const renameTemplate = async (e) => {
		e.preventDefault();
		let ret = await api.post(
			'template/rename',
			{ fromid: oldTplId, tplid: newTplId },
			user.sessionToken
		);
		if (ret.error) {
			if (ret.error === 'ALREADY_EXIST') {
				setFadeMessage('同名模板已存在, 请重新录入', 'warning');
			} else {
				setFadeMessage(ret.message, 'warning');
			}
		} else {
			form_status['rename'] = false;
			hide_all_form();
			//await theDesigner.setTemplateId(ret);
			goto(`/template/${ret.tplid}&${tpl_mode}`, {
				replaceState: true,
				keepfocus: true,
				noscroll: true
			});
			await theDesigner.loadTemplate(ret, tpl_mode);
		}
	};
	const copyTemplate = async (e) => {
		e.preventDefault();
		let ret = await api.post(
			'template/copyto',
			{ fromid: oldTplId, tplid: newTplId },
			user.sessionToken
		);
		if (ret.error) {
			if (ret.error === 'ALREADY_EXIST') {
				setFadeMessage('同名模板已存在, 请重新录入', 'warning');
			} else {
				setFadeMessage(ret.message, 'warning');
			}
		} else {
			template = ret;
			form_status['copyto'] = false;
			$title = template.tplid;
			goto(`/template/${template.tplid}&${tpl_mode}`, {
				replaceState: true,
				noscroll: true,
				keepfocus: true
			});
			//await theDesigner.loadTemplate(template.tplid, tpl_mode);
		}
		hide_all_form();
	};
</script>

<svelte:head>
	<title>{template.tplid} • Template</title>
</svelte:head>
{#if template.tplid === 'Not Found'}
	{#if $session.wfid}
		<ErrorNotify
			title="Original Template not Found"
			subtitle={`${tplid}`}
			info={`
				does not exist.
					Seems like you are trying to view the ORIGINAL TEMPLATE of a workflow ${$session.wfid},
					however, the ORIGINAL TEMPLATE of this workflow might have been deleted.
					you may view the INSTANCE TEMPLATE of this workflow instead`}
			btnTitle="View Instance Template Instead"
			callback={() => {
				viewInstanceTemplate($session.wfid);
			}}
		/>
	{:else}
		<ErrorNotify
			title="Error Found"
			subtitle="Template not found"
			info={`Template ${tplid} does not exist`}
			btnTitle="Back"
			callback={() => {
				goto('/template');
			}}
		/>
	{/if}
{:else}
	<div id="designer-topMenu" class={topmenu_class}>
		<Row class="mt-1 d-flex justify-content-center">
			<Col class="d-flex justify-content-center">
				<Nav>
					<NavLink
						class="kfk-link"
						on:click={() => {
							theDesigner.showTplProp();
						}}
					>
						<AniIcon icon="app" ani="aniShake" />
						{$_('tpl.prop')}
					</NavLink>
					{#if ClientPermControl(user.perms, user.email, 'template', template, 'create')}
						<NavLink
							class="kfk-link"
							on:click={() => {
								show_form('create');
							}}
						>
							<AniIcon icon="plus-circle" ani="aniShake" />
							{$_('tpl.new')}
						</NavLink>
					{:else}
						<NavLink disabled>
							<Icon name="plus-circle" />
							{$_('tpl.new')}
						</NavLink>
					{/if}
					<NavLink
						class="kfk-link"
						on:click={() => {
							show_form('export');
						}}
					>
						<AniIcon icon="cloud-download" ani="aniShake" />
						{$_('tpl.export')}
					</NavLink>
					{#if ClientPermControl(user.perms, user.email, 'template', template, 'create')}
						<NavLink
							class="kfk-link"
							on:click={() => {
								oldTplId = template.tplid;
								newTplId = template.tplid;
								show_form('copyto');
							}}
						>
							<AniIcon icon="files" ani="aniShake" />
							{$_('tpl.copyto')}
						</NavLink>
					{:else}
						<NavLink class="kfk-link" disabled>
							<Icon name="files" />
							{$_('tpl.copyto')}
						</NavLink>
					{/if}
					{#if template.ins === false}
						{#if ClientPermControl(user.perms, user.email, 'template', template, 'update')}
							<NavLink
								class="kfk-link"
								on:click={() => {
									oldTplId = template.tplid;
									newTplId = template.tplid;
									show_form('rename');
								}}
							>
								<AniIcon icon="input-cursor-text" ani="aniShake" />
								{$_('tpl.rename')}
							</NavLink>
						{:else}
							<NavLink class="kfk-link" disabled>
								<Icon name="input-cursor-text" />
								{$_('tpl.rename')}
							</NavLink>
						{/if}
						<!--
						{#if ClientPermControl(user.perms, user.email, 'template', template, 'delete')}
							<NavLink
								class="kfk-link"
								on:click={() => {
									show_form('delete');
								}}
							>
								<AniIcon icon="trash" ani="aniShake" />
								{$_('tpl.delete')}
							</NavLink>
						{:else}
							<NavLink class="kfk-link" disabled>
								<Icon name="trash" />
								{$_('tpl.delete')}
							</NavLink>
						{/if}
						-->
						{#if ClientPermControl(user.perms, user.email, 'template', template, 'update')}
							<NavLink
								class="kfk-link"
								on:click={async () => {
									hide_all_form();
									if (readonly) {
										await change_mode('edit');
									} else {
										await change_mode('read');
									}
								}}
							>
								<AniIcon icon={readonly ? 'pen' : 'eye'} ani="aniShake" />
								{readonly ? $_('tpl.editit') : $_('tpl.viewit')}
							</NavLink>
						{:else}
							<NavLink disabled>
								<Icon name={readonly ? 'pen' : 'eye'} />
								{readonly ? $_('tpl.editit') : $_('tpl.viewit')}
							</NavLink>
						{/if}
						{#if ClientPermControl(user.perms, user.email, 'workflow', '', 'create')}
							<NavLink
								class="kfk-link"
								on:click={() => {
									show_form('start');
								}}
							>
								<AniIcon icon="hypnotize" ani="aniSpin" />
								{$_('tpl.startit')}
							</NavLink>
						{:else}
							<NavLink disabled>
								<Icon name="hypnotize" />
								{$_('tpl.startit')}
							</NavLink>
						{/if}
					{/if}
				</Nav>
				<div class="ms-5">
					<input
						type="checkbox"
						class="form-check-input"
						bind:checked={showNodeId}
						on:change={async () => {
							await theDesigner.showNodeIdDIV(showNodeId);
						}}
					/>
					{$_('designer.showid')}
					<input
						type="checkbox"
						class="form-check-input"
						bind:checked={$filterStorage.curve}
						on:change={async () => {
							await theDesigner.setLineCurve($filterStorage.curve);
						}}
					/>
					{$_('designer.curve')}
				</div>
			</Col>
		</Row>
		<Row class="mt-2 d-flex justify-content-center">
			<Col class="d-flex justify-content-center">
				{#if form_status.create}
					<form
						action={urls.create}
						method="post"
						use:enhance={{
							token: user.sessionToken,
							result: async (res, form) => {
								const created = await res.json();
								if (created.error) {
									console.error(created.error);
									let errmsg = created.errMsg;
									if (errmsg.indexOf('MongoError: E11000 duplicate key error') >= 0) {
										errmsg = '同名模板已存在, 请重新录入';
									}
									setFadeMessage(errmsg, 'warning');
								} else {
									template = created;
									goto(`/template/${template.tplid}&${tpl_mode}`, {
										replaceState: false,
										keepfocus: true
									});
									await theDesigner.loadTemplate(template, tpl_mode);
									form_status['create'] = false;
									form.reset();
								}
								hide_all_form();
							}
						}}
					>
						<table class="form-table">
							<tr>
								<td>
									{$_('tpl.form.newtplname')}
								</td>
								<td>
									<input
										name="tplid"
										aria-label="Create template"
										placeholder="New template name"
										class="kfk_input_template_name"
										autocomplete="off"
									/>
								</td>
								<td>
									<Button type="submit" color="primary">
										{$_('button.create')}
									</Button>
								</td>
								<td>
									<Button
										on:click={(e) => {
											e.preventDefault();
											hide_all_form();
										}}
										color="secondary"
									>
										{$_('button.cancel')}
									</Button>
								</td>
							</tr>
						</table>
					</form>
				{:else if form_status.export}
					<form>
						<table class="form-table">
							<tr>
								<td>
									{$_('tpl.form.exportto')}
								</td>
								<td>
									<input
										name="exorttoname"
										placeholder="Export to file"
										class="kfk_input_template_name"
										bind:value={export_to_filename}
										autocomplete="off"
									/>
								</td>
								<td>
									<Button
										on:click={(e) => {
											e.preventDefault();
											export_template();
										}}
										color="primary"
									>
										{$_('button.export')}
									</Button>
								</td>
								<td>
									<Button
										on:click={(e) => {
											e.preventDefault();
											hide_all_form();
										}}
										color="secondary"
									>
										{$_('button.cancel')}
									</Button>
								</td>
							</tr>
						</table>
					</form>
				{:else if form_status.rename}
					<form>
						<table class="form-table">
							<tr>
								<td>
									{$_('tpl.form.renameto')}
								</td>
								<td>
									<input
										name="tplid"
										placeholder="Rename: new template name"
										class="kfk_input_template_name"
										bind:value={newTplId}
										autocomplete="off"
									/>
								</td>
								<td>
									<Button type="submit" color="primary" on:click={renameTemplate}>
										{$_('button.rename')}
									</Button>
								</td>
								<td>
									<Button
										on:click={(e) => {
											e.preventDefault();
											hide_all_form();
										}}
										color="secondary"
									>
										{$_('button.cancel')}
									</Button>
								</td>
							</tr>
						</table>
					</form>
				{:else if form_status.copyto}
					<form>
						<table class="form-table">
							<tr>
								<td>
									{$_('tpl.form.copyto')}
								</td>
								<td>
									<input
										name="tplid"
										placeholder="New template name"
										class="kfk_input_template_name"
										bind:value={newTplId}
										autocomplete="off"
									/>
								</td>
								<td>
									<Button type="submit" color="primary" on:click={copyTemplate}>
										{$_('button.copy')}
									</Button>
								</td>
								<td>
									<Button
										on:click={(e) => {
											e.preventDefault();
											hide_all_form();
										}}
										color="secondary"
									>
										{$_('button.cancel')}
									</Button>
								</td>
							</tr>
						</table>
					</form>
				{:else if form_status.delete}
					<table class="form-table">
						<tr>
							<td>
								{$_('tpl.delete')}
							</td>
							<td>
								<Button on:click={() => delete_template()} color="primary">
									{$_('button.delete')}
								</Button>
							</td>
							<td>
								<Button
									on:click={(e) => {
										e.preventDefault();
										hide_all_form();
									}}
									color="secondary"
								>
									{$_('button.cancel')}
								</Button>
							</td>
						</tr>
					</table>
				{:else if form_status.start}
					<table class="form-table">
						<tr>
							<td>
								Start: {template.tplid}?&nbsp;
							</td>
							<td>
								<Button
									on:click={() => {
										goto(`/template/start?tplid=${template.tplid}`, { replaceState: false });
									}}
									color="primary"
								>
									{$_('button.startnow')}
								</Button>
							</td>
							<td>
								<Button
									on:click={(e) => {
										e.preventDefault();
										hide_all_form();
									}}
									color="secondary"
								>
									{$_('button.cancel')}
								</Button>
							</td>
						</tr>
					</table>
				{/if}
			</Col>
		</Row>
	</div>
	<svelte:component
		this={Designer}
		bind:this={theDesigner}
		{template}
		{tpl_mode}
		on:readInProp={(e) => {
			change_mode('read');
			console.log(e.detail);
			//theDesigner.reloadNodeProp(e.detail);
		}}
		on:editInProp={(e) => {
			change_mode('edit');
			console.log(e.detail);
			//theDesigner.reloadNodeProp(e.detail);
		}}
	/>
{/if}

<style>
	.form-table td {
		padding-left: 10px;
	}
</style>
