<script context="module" lang="ts">
	export const ssr = false;
	import {session} from '$app/stores';
	export async function load({ page, fetch }) {
		const res = await fetch(`/template/@${page.params.tplid}.json`);

		return {
			props: {
				template: await res.json()
			}
		};
	}
</script>

<script lang="ts">
	import type {Template} from '$lib/types';
	import { onMount } from 'svelte';
	export let template: Template;

	let Designer:any;
	onMount(async()=>{
		console.log("import Designer...");
		await import('jquery-ui-dist/jquery-ui.min.css');
		const module = await import('$lib/designer/Designer.svelte');
		Designer = module.default;

	
	});
</script>

<svelte:head>
	<title>{template.tplid} • Conduit</title>
</svelte:head>

<div class="container">
	<div class="row">
		<div class="col-xs-12 col-md-10 offset-md-1">
				<ul class="nav nav-pills outline-active">
					<li class="nav-item">
						<a href="/" class="nav-link" rel="prefetch">试运行</a>
					</li>
					<li class="nav-item">
						<a href="/" class="nav-link" rel="prefetch">导出</a>
					</li>
					<li class="nav-item">
						<a href="/" class="nav-link" rel="prefetch">重命名</a>
					</li>
					<li class="nav-item">
						<a href="/" class="nav-link" rel="prefetch">复制</a>
					</li>
					<li class="nav-item">
						<a href="/" class="nav-link" rel="prefetch">删除</a>
					</li>
					<li class="nav-item">
						<a href="/" class="nav-link" rel="prefetch">数据</a>
					</li>
				</ul>
		</div>
	</div>
	<div class="row">
		<div class="col-xs-12 col-md-10 offset-md-1">
			hello
		</div>
	</div>
</div>

<svelte:component this={Designer} {template}/>

{template.author}
{template.doc}
