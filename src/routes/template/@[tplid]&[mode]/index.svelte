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
	import jQuery from 'jquery';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { title } from '$lib/title';
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import { Container, Row, Col, Nav, NavLink } from 'sveltestrap';
	import { Icon, Button, Modal, ModalBody, ModalFooter, ModalHeader, Styles } from 'sveltestrap';
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
		delete: false
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
	}
	function show_form(what: string) {
		hide_all_form();
		form_status[what] = true;
		form_name = what;
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
</script>

<Styles />

<svelte:head>
	<title>{template.tplid} • Template</title>
</svelte:head>
{#if template.tplid === 'Not Found'}
	<Container>
		<Row>
			<Col>
				Template {tplid} not found <br />
				{#if $session.wfid}
					Seems like you are trying to view the ORIGINAL TEMPLATE of a workflow {$session.wfid},
					<br />however, the ORIGINAL TEMPLATE of this workflow might have been deleted. <br />
					you may
					<a
						href={'#'}
						on:click={() => {
							viewInstanceTemplate($session.wfid);
						}}
					>
						view the INSTANCE TEMPLATE
					</a> of this workflow instead
				{/if}
			</Col>
		</Row>
	</Container>
{:else}
	<div id="designer_topMenu" class={topmenu_class}>
		<Container>
			<Row class="mt-1">
				<Col class="d-flex justify-content-center">
					<Nav>
						<NavLink
							class="kfk-link"
							on:click={() => {
								show_form('create');
							}}
						>
							<Icon name="plus-circle" />
							New
						</NavLink>
						<NavLink
							class="kfk-link"
							on:click={() => {
								show_form('export');
							}}
						>
							<Icon name="cloud-download" />
							Export
						</NavLink>
						<NavLink
							class="kfk-link"
							on:click={() => {
								show_form('copyto');
							}}
						>
							<Icon name="files" />
							Copy to
						</NavLink>
						{#if template.ins === false}
							<NavLink
								class="kfk-link"
								on:click={() => {
									show_form('rename');
								}}
							>
								<Icon name="input-cursor-text" />
								Rename
							</NavLink>
							<NavLink
								class="kfk-link"
								on:click={() => {
									show_form('delete');
								}}
							>
								<Icon name="trash" />
								Delete
							</NavLink>
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
						{/if}
					</Nav>
				</Col>
			</Row>
			<Row class="mt-2">
				<Col>
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
							New template name:
							<input
								name="tplid"
								aria-label="Create template"
								placeholder="New template name"
								class="kfk_input_template_name"
								autocomplete="off"
							/>
							<Button type="submit" color="primary">Create</Button>
							<Button
								on:click={(e) => {
									e.preventDefault();
									hide_all_form();
								}}
								color="secondary">Cancel</Button
							>
							{#if errmsg !== ''}{errmsg}{/if}
						</form>
					{:else if form_status.export}
						Export current template to:
						<input
							name="exorttoname"
							placeholder="Export to file"
							class="kfk_input_template_name"
							bind:value={export_to_filename}
							autocomplete="off"
						/>
						<Button on:click={() => export_template()} color="primary">Export</Button>
						<Button
							on:click={(e) => {
								e.preventDefault();
								hide_all_form();
							}}
							color="secondary">Cancel</Button
						>
						{#if errmsg !== ''}{errmsg}{/if}
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
							Rename {template.tplid} to:
							<input
								name="tplid"
								placeholder="Rename: new template name"
								class="kfk_input_template_name"
								value={template.tplid}
								autocomplete="off"
							/>
							<input type="hidden" name="fromid" value={template.tplid} />
							<Button type="submit" color="primary">Rename</Button>
							<Button
								on:click={(e) => {
									e.preventDefault();
									hide_all_form();
								}}
								color="secondary">Cancel</Button
							>
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
							Copy {template.tplid} to:
							<input
								name="tplid"
								placeholder="New template name"
								class="kfk_input_template_name"
								value={template.tplid}
								autocomplete="off"
							/>
							<input type="hidden" name="fromid" value={template.tplid} />
							<Button type="submit" color="primary">Copy</Button>
							<Button
								on:click={(e) => {
									e.preventDefault();
									hide_all_form();
								}}
								color="secondary">Cancel</Button
							>
							{#if errmsg !== ''}{errmsg}{/if}
						</form>
					{:else if form_status.delete}
						Delete: {template.tplid}?&nbsp;
						<Button on:click={() => delete_template()} color="primary">Delete</Button>
						<Button
							on:click={(e) => {
								e.preventDefault();
								hide_all_form();
							}}
							color="secondary">Cancel</Button
						>
						{#if errmsg !== ''}{errmsg}{/if}
					{/if}
				</Col></Row
			>
		</Container>
	</div>
	<svelte:component this={Designer} bind:this={theDesigner} {template} {tpl_mode} />
{/if}
