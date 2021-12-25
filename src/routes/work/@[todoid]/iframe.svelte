<script context="module" lang="ts">
	export const ssr = false;
	let TimeTool = null;
	export async function load({ page, fetch, session }) {
		TimeTool = (await import('$lib/TimeTool')).default;
		const todoid = page.params.todoid;
		const res = await fetch(`/work/@${todoid}.json`);
		const res_html = await fetch(`/work/@${todoid}/html.json`);

		const theWork = await res.json();
		const theHtml = await res_html.json();

		return {
			props: {
				work: theWork,
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import type { User, Work } from '$lib/types';
	import { title } from '$lib/title';
	import WorkPage from './workpage.svelte';
	import { Container } from 'sveltestrap';
	export let work: Work;
	export let user: User;

	let radioGroup;

	$title = work.title;

	let iframe = true;
</script>

<Container>
	<div class="d-flex">
		<div class="flex-shrink-0">
			<h1>{work.title}</h1>
		</div>
		<div class="mx-5 align-self-center flex-grow-1">
			{TimeTool.fromNow(work.createdAt)}
		</div>
	</div>
</Container>
<Container>
	<WorkPage {work} {user} {iframe} />
</Container>
