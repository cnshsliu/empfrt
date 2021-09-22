<script context="module" lang="ts">
	export const ssr = false;
	export async function load({ page, fetch, session }) {
		const tplid = page.params.tplid;
		const tpl_mode = page.params.mode;
		const jsonUrl = `/template/@${tplid}&${tpl_mode}.json`;
		const res = await fetch(jsonUrl);

		return {
			props: {
				template: await res.json(),
				tpl_mode,
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import jQuery from 'jquery';
	import { goto } from '$app/navigation';
	import { title } from '$lib/title';
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import { Container, Row, Col, Nav, NavLink } from 'sveltestrap';
	import { Icon, Button, Modal, ModalBody, ModalFooter, ModalHeader, Styles } from 'sveltestrap';
	import { enhance } from '$lib/form';
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
		await theDesigner.theKFK.loadDoc(template, tpl_mode);
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
</script>

<Styles />

<svelte:head>
	<title>{template.tplid} • Template</title>
</svelte:head>
<div id="topMenu" class={topmenu_class}>
	<Container>
		<Row>
			<Col>
				<Nav>
					<NavLink
						on:click={() => {
							show_form('create');
						}}
					>
						<Icon name="plus-circle" />
						New
					</NavLink>
					<NavLink
						on:click={() => {
							show_form('export');
						}}
					>
						<Icon name="cloud-download" />
						Export
					</NavLink>
					<NavLink
						on:click={() => {
							show_form('rename');
						}}
					>
						<Icon name="input-cursor-text" />
						Rename
					</NavLink>
					<NavLink
						on:click={() => {
							show_form('copyto');
						}}
					>
						<Icon name="files" />
						Copy to
					</NavLink>
					<NavLink
						on:click={() => {
							show_form('delete');
						}}
					>
						<Icon name="trash" />
						Delete
					</NavLink>
					<NavLink
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
				</Nav>
			</Col>
		</Row>
		{#if form_status.create}
			<Row>
				<Col>
					<form
						action="http://localhost:5008/template/create"
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
									theDesigner.sayHello();
									theDesigner.theKFK.sayHello();
									await theDesigner.theKFK.loadDoc(template, tpl_mode);
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
							autofocus
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
				</Col>
			</Row>
		{:else if form_status.export}
			<Row>
				<Col>
					Export current template to:
					<input
						name="exorttoname"
						placeholder="Export to file"
						class="kfk_input_template_name"
						bind:value={export_to_filename}
						autofocus
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
				</Col>
			</Row>
		{:else if form_status.rename}
			<Row>
				<Col>
					<form
						action="http://localhost:5008/template/rename"
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
									theDesigner.sayHello();
									theDesigner.theKFK.sayHello();
									await theDesigner.theKFK.loadDoc(template, tpl_mode);
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
							autofocus
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
				</Col>
			</Row>
		{:else if form_status.copyto}
			<Row>
				<Col>
					<form
						class="new"
						action="http://localhost:5008/template/copyto"
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
									theDesigner.sayHello();
									theDesigner.theKFK.sayHello();
									await theDesigner.theKFK.loadDoc(template, tpl_mode);
									form_status['copyto'] = false;
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
							autofocus
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
				</Col>
			</Row>
		{:else if form_status.delete}
			<Row>
				<Col>
					<div>Are you sure to delete template:</div>
					<div>
						{template.tplid}?
					</div>
					<div>&nbsp;</div>
					<Button on:click={() => delete_template()} color="primary">Delete</Button>
					<Button
						on:click={(e) => {
							e.preventDefault();
							hide_all_form();
						}}
						color="secondary">Cancel</Button
					>
					{#if errmsg !== ''}{errmsg}{/if}
				</Col>
			</Row>
		{/if}
	</Container>
</div>
<svelte:component this={Designer} bind:this={theDesigner} {template} {tpl_mode} />
