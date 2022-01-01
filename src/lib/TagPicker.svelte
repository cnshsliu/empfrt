<script lang="ts">
	import { Button, Row, Col, Input } from 'sveltestrap';
	import { TagStorage } from '$lib/empstores';
	import { onMount } from 'svelte';
	import { session } from '$app/stores';
	import * as api from '$lib/api';

	let user = $session.user;
	export let currentTags = [];
	export let useThisTag;
	export let clearTag;
	let allTags: any = {
		org: [],
		mine: []
	};

	async function reloadTags() {
		allTags = $TagStorage;
		if (allTags && allTags.org && allTags.mine) {
			console.log('user allTags in session');
		} else {
			console.log('refreshTags from server');
			allTags.org = await api.post('tag/org', {}, user.sessionToken);
			allTags.mine = await api.post('tag/list', { objtype: 'template' }, user.sessionToken);
			$TagStorage = allTags;
		}
	}

	onMount(async () => {
		await reloadTags();
	});
</script>

{#if allTags && allTags.org && Array.isArray(allTags.org)}
	<div class="d-flex">
		<div class="w-100">
			<Row class="mb-2">
				<Col class="d-flex justify-content-center">
					<Button
						color={currentTags.length === 0 || currentTags[0].length === 0 ? 'primary' : 'light'}
						class={`mx-1 badge  border border-primary ${
							currentTags.length === 0 || currentTags[0].length === 0
								? 'text-white'
								: 'text-primary'
						}`}
						on:click={(e) => {
							e.preventDefault();
							clearTag('');
						}}
					>
						All
					</Button>
					{#each allTags.org as tag}
						<Button
							color={currentTags.includes(tag) ? 'primary' : 'light'}
							class={`mx-1 badge  border border-primary ${
								currentTags.includes(tag) ? 'text-white' : 'text-primary'
							}`}
							on:click={(e) => {
								e.preventDefault();
								useThisTag(tag, e.shiftKey);
							}}
						>
							{tag}
						</Button>
					{/each}
				</Col>
			</Row>
			<Row>
				<Col class="d-flex justify-content-center">
					{#each allTags.mine as tag}
						<Button
							size="sm"
							color={currentTags.includes(tag) ? 'primary' : 'light'}
							class={`mx-1 badge kfk-round border border-primary ${
								currentTags.includes(tag) ? 'text-white' : 'text-primary'
							}`}
							on:click={(e) => {
								e.preventDefault();
								useThisTag(tag, e.shiftKey);
							}}
						>
							{tag}
						</Button>
					{/each}
				</Col>
			</Row>
		</div>
		<div class="flex-shrink-1" />
	</div>
{/if}
