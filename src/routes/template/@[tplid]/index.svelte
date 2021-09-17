<script context="module" lang="ts">
	export const ssr = false;
	import { session } from '$app/stores';
	export async function load({ page, fetch, session }) {
		const res = await fetch(`/template/@${page.params.tplid}.json`);

		return {
			props: {
				template: await res.json(),
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import { navigate } from 'svelte-navigator';
	import { onMount } from 'svelte';
	import { Container, Row, Col } from 'sveltestrap';
	import { enhance } from '$lib/form';
	export let template: Template;

	let Designer: any;
	let theDesigner;
	onMount(async () => {
		console.log('import Designer...');
		const module = await import('$lib/designer/Designer.svelte');
		Designer = module.default;
	});

	export let form_status = { create: false, search: false, sort: false };
	export let errmsg = '';
	export let user: User;
	function hide_all_form() {
		Object.keys(form_status).forEach((key) => {
			form_status[key] = false;
		});
		errmsg = '';
	}
	function show_create_template_form() {
		hide_all_form();
		form_status['create'] = true;
	}
	function show_search_template_form() {
		hide_all_form();
		form_status['search'] = true;
	}
</script>

<svelte:head>
	<title>{template.tplid} • Conduit</title>
</svelte:head>
<div class="container" id="topMenu">
	<Container class="docopmenu">
		<Row>
			<Col>
				<ul class="nav nav-pills outline-active">
					<li class="nav-item">
						<a href={'#'} on:click={show_create_template_form} class="nav-link">新建</a>
					</li>
					<li class="nav-item">
						<a href="/" class="nav-link">试运行</a>
					</li>
					<li class="nav-item">
						<a href="/" class="nav-link">导出</a>
					</li>
					<li class="nav-item">
						<a href="/" class="nav-link">重命名</a>
					</li>
					<li class="nav-item">
						<a href="/" class="nav-link">复制</a>
					</li>
					<li class="nav-item">
						<a href="/" class="nav-link">删除</a>
					</li>
					<li class="nav-item">
						<a href="/" class="nav-link">数据</a>
					</li>
				</ul>
			</Col>
		</Row>
		{#if form_status.create}
			<Row>
				<Col>
					<form
						class="new"
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
									navigate(`/template/@${template.tplid}`);
									theDesigner.sayHello();
									theDesigner.theKFK.sayHello();
									theDesigner.theKFK.init(template, user);
									form_status['create'] = false;
									form.reset();
									errmsg = '';
								}
							}
						}}
					>
						<input
							name="tplid"
							aria-label="Create template"
							placeholder="New template name"
							class="kfk_input_template_name"
							autofocus
						/>
						<input type="submit" name="submit" value="submit" />
						<input
							type="button"
							name="cancel"
							value="Cancel"
							on:click|preventDefault={() => hide_all_form()}
						/>
						{#if errmsg !== ''}{errmsg}{/if}
					</form>
				</Col>
			</Row>
		{/if}
	</Container>
</div>
<svelte:component this={Designer} bind:this={theDesigner} {template} />
