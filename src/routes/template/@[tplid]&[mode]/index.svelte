<script context="module" lang="ts">
	export const ssr = false;
	export async function load({ page, fetch, session }) {
		const tplid = page.params.tplid;
		const tpl_mode = page.params.mode;
		const jsonUrl = `/template/@${tplid}&${tpl_mode}.json`;
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
	import { API_SERVER } from '$lib/Env';
	import type { User, Template, Team } from '$lib/types';
	import ErrorNotify from '$lib/ErrorNotify.svelte';
	import jQuery from 'jquery';
	import { get } from 'svelte/store';
	import { ClientPermControl } from '$lib/clientperm';
	import Parser from '$lib/parser';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { title } from '$lib/title';
	import * as api from '$lib/api';
	import { Container, Row, Col, Nav, NavLink } from 'sveltestrap';
	import { Icon, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
	import { onMount } from 'svelte';
	import { enhance } from '$lib/form';
	export let tplid;
	export let template: Template;
	export let tpl_mode: string;

	const jq = jQuery;

	$title = template.tplid;
	let Designer: any;
	let theDesigner: any;
	onMount(async () => {
		console.log('import Designer...');
		const module = await import('$lib/designer/Designer.svelte');
		Designer = module.default;
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
	export let errmsg = '';
	export let user: User;

	$: topmenu_class = form_name === '' ? '' : 'whiteback';
	function hide_all_form() {
		Object.keys(form_status).forEach((key) => {
			form_status[key] = false;
		});
		form_name = '';
		errmsg = '';
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
		goto(`/template/@${template.tplid}&${tpl_mode}`, {
			replaceState: true,
			noscroll: true,
			keepfocus: true
		});
		await theDesigner.changeViewMode(tpl_mode);
	}
	async function startIt() {
		goto(`/template/@${template.tplid}&${tpl_mode}`, {
			replaceState: true,
			noscroll: true,
			keepfocus: true
		});
		await theDesigner.changeViewMode(tpl_mode);
	}
	$: readonly = tpl_mode === 'read';
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
	function export_template() {
		if (export_to_filename.endsWith('.xml'))
			export_to_filename = export_to_filename.substring(0, export_to_filename.lastIndexOf('.xml'));
		api.post('template/download', { tplid: template.tplid }, user.sessionToken).then((response) => {
			const url = window.URL.createObjectURL(new Blob([response]));
			jq('.tempLink').remove();
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
		goto(`/template/@${wfid}_instemplate&read`);
		$title = wfid + '_instemplate';
		return;
	}

	let fade_message = '';
	let fade_timer: any;
	function setFadeMessage(message: string, time = 2000) {
		fade_message = message;
		if (fade_timer) clearTimeout(fade_timer);
		fade_timer = setTimeout(() => {
			fade_message = '';
		}, time);
	}
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
					{#if ClientPermControl(user.perms, user.email, 'template', template, 'create')}
						<NavLink
							class="kfk-link"
							on:click={() => {
								show_form('create');
							}}
						>
							<Icon name="plus-circle" />
							New
						</NavLink>
					{:else}
						<NavLink disabled>
							<Icon name="plus-circle" />
							New
						</NavLink>
					{/if}
					<NavLink
						class="kfk-link"
						on:click={() => {
							show_form('export');
						}}
					>
						<Icon name="cloud-download" />
						Export
					</NavLink>
					{#if ClientPermControl(user.perms, user.email, 'template', template, 'create')}
						<NavLink
							class="kfk-link"
							on:click={() => {
								show_form('copyto');
							}}
						>
							<Icon name="files" />
							Copy to
						</NavLink>
					{:else}
						<NavLink class="kfk-link" disabled>
							<Icon name="files" />
							Copy to
						</NavLink>
					{/if}
					{#if template.ins === false}
						{#if ClientPermControl(user.perms, user.email, 'template', template, 'update')}
							<NavLink
								class="kfk-link"
								on:click={() => {
									show_form('rename');
								}}
							>
								<Icon name="input-cursor-text" />
								Rename
							</NavLink>
						{:else}
							<NavLink class="kfk-link" disabled>
								<Icon name="input-cursor-text" />
								Rename
							</NavLink>
						{/if}
						{#if ClientPermControl(user.perms, user.email, 'template', template, 'delete')}
							<NavLink
								class="kfk-link"
								on:click={() => {
									show_form('delete');
								}}
							>
								<Icon name="trash" />
								Delete
							</NavLink>
						{:else}
							<NavLink class="kfk-link" disabled>
								<Icon name="trash" />
								Delete
							</NavLink>
						{/if}
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
								<Icon name={readonly ? 'pen' : 'eye'} />
								{readonly ? 'Edit it' : 'View it'}
							</NavLink>
						{:else}
							<NavLink disabled>
								<Icon name={readonly ? 'pen' : 'eye'} />
								{readonly ? 'Edit it' : 'View it'}
							</NavLink>
						{/if}
						{#if ClientPermControl(user.perms, user.email, 'workflow', '', 'create')}
							<NavLink
								class="kfk-link"
								on:click={() => {
									show_form('start');
								}}
							>
								<Icon name="trash" />
								Start it
							</NavLink>
						{:else}
							<NavLink disabled>
								<Icon name="trash" />
								Start it
							</NavLink>
						{/if}
					{/if}
				</Nav>
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
								console.log(created);
								if (created.error) {
									console.log(created.error);
									errmsg = created.errMsg;
									if (errmsg.indexOf('MongoError: E11000 duplicate key error') >= 0) {
										errmsg = '同名模板已存在, 请重新录入';
									}
								} else {
									template = created;
									goto(`/template/@${template.tplid}&${tpl_mode}`, {
										replaceState: false,
										keepfocus: true
									});
									await theDesigner.loadTemplate(template, tpl_mode);
									form_status['create'] = false;
									form.reset();
									errmsg = '';
								}
								hide_all_form();
							}
						}}
					>
						<table class="form-table">
							<tr>
								<td> New template name: </td>
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
									<Button type="submit" color="primary">Create</Button>
								</td>
								<td>
									<Button
										on:click={(e) => {
											e.preventDefault();
											hide_all_form();
										}}
										color="secondary"
									>
										Cancel
									</Button>
								</td>
							</tr>
						</table>
						{#if errmsg !== ''}{errmsg}{/if}
					</form>
				{:else if form_status.export}
					<form>
						<table class="form-table">
							<tr>
								<td> Export current template to: </td>
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
										color="primary">Export</Button
									>
								</td>
								<td>
									<Button
										on:click={(e) => {
											e.preventDefault();
											hide_all_form();
										}}
										color="secondary">Cancel</Button
									>
								</td>
							</tr>
						</table>
						{#if errmsg !== ''}{errmsg}{/if}
					</form>
				{:else if form_status.rename}
					<form
						action={urls.rename}
						method="post"
						use:enhance={{
							token: user.sessionToken,
							result: async (res, form) => {
								const newTemplate = await res.json();
								console.log(newTemplate);
								if (newTemplate.error) {
									console.log(newTemplate.error);
									errmsg = newTemplate.errMsg;
									if (errmsg.indexOf('MongoError: E11000 duplicate key error') >= 0) {
										errmsg = '同名模板已存在, 请重新录入';
									}
								} else {
									template = newTemplate;
									goto(`/template/@${template.tplid}&${tpl_mode}`, {
										replaceState: true,
										keepfocus: true,
										noscroll: true
									});
									await theDesigner.loadTemplate(template, tpl_mode);
									form_status['rename'] = false;
									form.reset();
									errmsg = '';
								}
								hide_all_form();
							}
						}}
					>
						<table class="form-table">
							<tr>
								<td>
									Rename {template.tplid} to:
								</td>
								<td>
									<input
										name="tplid"
										placeholder="Rename: new template name"
										class="kfk_input_template_name"
										value={template.tplid}
										autocomplete="off"
									/>
									<input type="hidden" name="fromid" value={template.tplid} />
								</td>
								<td>
									<Button type="submit" color="primary">Rename</Button>
								</td>
								<td>
									<Button
										on:click={(e) => {
											e.preventDefault();
											hide_all_form();
										}}
										color="secondary">Cancel</Button
									>
								</td>
							</tr>
						</table>
						{#if errmsg !== ''}{errmsg}{/if}
					</form>
				{:else if form_status.copyto}
					<form
						class="new"
						action={urls.copyto}
						method="post"
						use:enhance={{
							token: user.sessionToken,
							result: async (res, form) => {
								const created = await res.json();
								console.log(created);
								if (created.error) {
									console.log(created.error);
									errmsg = created.errMsg;
									if (errmsg.indexOf('MongoError: E11000 duplicate key error') >= 0) {
										errmsg = '同名模板已存在, 请重新录入';
									}
								} else {
									template = created;
									goto(`/template/@${template.tplid}&${tpl_mode}`, {
										replaceState: true,
										noscroll: true,
										keepfocus: true
									});
									await theDesigner.loadTemplate(template, tpl_mode);
									form_status['copyto'] = false;
									$title = template.tplid;
									form.reset();
									errmsg = '';
								}
								hide_all_form();
							}
						}}
					>
						<table class="form-table">
							<tr>
								<td>
									Copy {template.tplid} to:
								</td>
								<td>
									<input
										name="tplid"
										placeholder="New template name"
										class="kfk_input_template_name"
										value={template.tplid}
										autocomplete="off"
									/>
									<input type="hidden" name="fromid" value={template.tplid} />
								</td>
								<td>
									<Button type="submit" color="primary">Copy</Button>
								</td>
								<td>
									<Button
										on:click={(e) => {
											e.preventDefault();
											hide_all_form();
										}}
										color="secondary"
									>
										Cancel
									</Button>
								</td>
							</tr>
						</table>
						{#if errmsg !== ''}{errmsg}{/if}
					</form>
				{:else if form_status.delete}
					<table class="form-table">
						<tr>
							<td>
								Delete: &nbsp; {template.tplid}?&nbsp;
							</td>
							<td>
								<Button on:click={() => delete_template()} color="primary">Delete</Button>
							</td>
							<td>
								<Button
									on:click={(e) => {
										e.preventDefault();
										hide_all_form();
									}}
									color="secondary"
								>
									Cancel
								</Button>
							</td>
						</tr>
					</table>
					{#if errmsg !== ''}{errmsg}{/if}
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
									Start now
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
									Cancel
								</Button>
							</td>
						</tr>
					</table>
					{#if errmsg !== ''}{errmsg}{/if}
				{/if}
			</Col>
		</Row>
	</div>
	<svelte:component this={Designer} bind:this={theDesigner} {template} {tpl_mode} />
{/if}

<style>
	.form-table td {
		padding-left: 10px;
	}
</style>
