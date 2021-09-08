<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		const res = await fetch("/template.json");

		return {
			props: {
				templates: await res.json(),
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import type { Template, User } from '$lib/types';
	import TemplateList from './_TemplateList.svelte';
	export let templates: Template[];
	export let user: User;
</script>

<div class="settings-page">
	<div class="container page">
		<div class="row">
			<div class="col-md-6 offset-md-3 col-xs-12">
				<h1 class="text-xs-center">{user.username} Templates</h1>

				<hr />
			</div>
		</div>
		<TemplateList {templates} />
	</div>
</div>
