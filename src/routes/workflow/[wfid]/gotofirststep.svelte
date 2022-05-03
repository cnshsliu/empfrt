<script context="module" lang="ts">
	export async function load({ url, params, fetch, session }) {
		const wfid = params.wfid;

		try {
			return {
				props: {
					wfid: params.wfid,
					user: session.user
				}
			};
		} catch (e) {
			console.error(e);
		}
	}
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import ErrorNotify from '$lib/ErrorNotify.svelte';

	export let wfid;
	export let user;

	let status = '';
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
			goto(`/work/${todoid}`, { replaceState: true });
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
