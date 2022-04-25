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

	let status = '';
	let wfid = $page.params.wfid;
	let todoid = 'tobefind';
	let checkTimers = 0;
	let checkInterval = null;
	checkInterval = setInterval(async () => {
		todoid = (await api.post(
			'workflow/get/firsttodoid',
			{ wfid: wfid },
			user.sessionToken
		)) as unknown as string;
		if (todoid.length > 0) {
			status = '';
			clearInterval(checkInterval);
			goto(`/work/@${todoid}`, { replaceState: true });
		} else {
			checkTimers++;
			status = 'checking';
			if (checkTimers > 10) {
				clearInterval(checkInterval);
			}
		}
	}, 300);
</script>

{#if status === 'NOT_FOUND'}
	<ErrorNotify
		title="Error Found"
		subtitle="Workflow first todo not found"
		info={`Work does not exist`}
		btnTitle="Back"
		callback={() => {
			goto('/work');
		}}
	/>
{:else if status === 'checking'}
	<div class="row text-center">Checking</div>
{/if}
