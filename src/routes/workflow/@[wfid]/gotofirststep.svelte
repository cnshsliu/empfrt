<script context="module" lang="ts">
	export async function load({ page, fetch, session }) {
		const wfid = page.params.wfid;

		try {
			return {
				props: {
					wfid: page.params.wfid
				}
			};
		} catch (e) {
			console.error(e);
		}
	}
</script>

<script lang="ts">
	import { page, session } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import ErrorNotify from '$lib/ErrorNotify.svelte';

	let user = $session.user;

	let wfid = $page.params.wfid;
	let todoid = 'tobefind';
	setTimeout(async () => {
		todoid = (await api.post(
			'workflow/get/firsttodoid',
			{ wfid: wfid },
			user.sessionToken
		)) as unknown as string;
		if (todoid.length > 0) goto(`/work/@${todoid}`, { replaceState: true });
	});
</script>

{#if todoid.length === 0}
	<ErrorNotify
		title="Error Found"
		subtitle="Workflow not found"
		info={`Work does not exist`}
		btnTitle="Back"
		callback={() => {
			goto('/work');
		}}
	/>
{/if}
