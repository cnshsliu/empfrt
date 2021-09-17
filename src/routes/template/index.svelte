<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		const res = await fetch('/template.json');

		return {
			props: {
				templates: await res.json(),
				user: session.user,
				config: session.config
			}
		};
	}
</script>

<script lang="ts">
	import * as api from '$lib/api';
	import { Row, Col } from 'sveltestrap';
	import { enhance } from '$lib/form';
	import TemplateList from './_TemplateList.svelte';
	export let templates: Template[];
	export let user: User;
	export let config: Config;
	export let lastSearchCondition: string = '';
	export let form_status = { create: false, search: false, sort: false };
	function hide_all_form() {
		Object.keys(form_status).forEach((key) => {
			form_status[key] = false;
		});
	}
	function show_create_template_form() {
		hide_all_form();
		form_status['create'] = true;
	}
	function show_search_template_form() {
		hide_all_form();
		form_status['search'] = true;
	}
	function sortBy(field: string, order: number) {
		config.sort = { field, order };
		templates = templates.sort((a, b): number => {
			let A: number | string = field === 'tplid' ? a.tplid : Date.parse(a.createdAt);
			let B: number | string = field === 'tplid' ? b.tplid : Date.parse(b.createdAt);
			if (A === B) {
				return 0;
			} else if (A > B) {
				return order;
			} else return 0 - order;
		});
		/*
		setTimeout(async () => {
			const res = await api.post(
				'template/search',
				{
					tplid: lastSearchCondition,
					sort_field: field,
					sort_order: order
				},
				user.sessionToken
			);
			console.log(res);
			templates = res; //eslint-disable-line
			for (let i = 0; i < templates.length; i++) {
				console.log(Date.parse(templates[i].createdAt));
			}
		}, 0);
		*/
	}
</script>

<div class="settings-page">
	<div class="container page">
		<div class="row">
			<div class="col-md-6 offset-md-3 col-xs-12">
				<h1 class="text-xs-center">{user.username} Templates</h1>
				<ul class="nav nav-pills outline-active">
					<li class="nav-item">
						<a href={'#'} on:click={show_create_template_form} class="nav-link">新建</a>
					</li>
					<li class="nav-item">
						<a href={'#'} on:click={show_search_template_form} class="nav-link">搜索</a>
					</li>
				</ul>
				{#if form_status.create}
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
								} else {
									templates = [created, ...templates];
									lastSearchCondition = created.tplid;
								}
								form.reset();
								//form_status['create'] = false;
							}
						}}
					>
						<input
							name="tplid"
							aria-label="Create template"
							placeholder="New template name"
							class="kfk_input_template_name"
						/>
					</form>
				{:else if form_status.search}
					<form
						class="new"
						action="http://localhost:5008/template/search"
						method="post"
						use:enhance={{
							token: user.sessionToken,
							result: async (res, form) => {
								const tmp = await res.json();
								if (tmp.error) {
									console.log(tmp.error);
								} else {
									templates = tmp;
								}
								//form_status['search'] = false;
							}
						}}
					>
						<input name="sort_field" type="hidden" bind:value={config.sort.field} />
						<input name="sort_order" type="hidden" bind:value={config.sort.order} />
						<input
							name="tplid"
							bind:value={lastSearchCondition}
							aria-label="Search template"
							placeholder="What to search for"
							class="kfk_input_template_name"
						/>
					</form>
				{/if}
				<Row>
					<Col>
						<a href={'#'} on:click|preventDefault={() => sortBy('tplid', 1)} class="nav-link">
							顺排名称
						</a>
					</Col>
					<Col>
						<a href={'#'} on:click|preventDefault={() => sortBy('tplid', -1)} class="nav-link">
							倒排名称
						</a>
					</Col>
					<Col>
						<a href={'#'} on:click|preventDefault={() => sortBy('createdAt', 1)} class="nav-link">
							顺排日期
						</a>
					</Col>
					<Col>
						<a href={'#'} on:click|preventDefault={() => sortBy('createdAt', -1)} class="nav-link">
							倒排日期
						</a>
					</Col>
				</Row>
				<hr />
			</div>
		</div>
		<TemplateList {templates} />
	</div>
</div>
