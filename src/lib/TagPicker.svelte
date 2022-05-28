<script lang="ts">
	import { _ } from '$lib/i18n';
	import { Button, Row, Col, Input } from 'sveltestrap';
	import { TagStorage, filterStorage } from '$lib/empstores';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import * as api from '$lib/api';

	const dispatch = createEventDispatcher();
	let user = $session.user;
	export let currentTags = [];
	export let BIZ;
	export let useThisTag;
	export let clearTag;
	let allTags: any = {
		org: [],
		mine: [],
	};

	async function reloadTags() {
		allTags = $TagStorage;
		if (allTags && allTags.org && Array.isArray(allTags.org)) {
		} else {
			allTags.org = await api.post('tag/org', {}, user.sessionToken);
			allTags.mine = await api.post('tag/list', { objtype: 'template' }, user.sessionToken);
			if (allTags && allTags.org && Array.isArray(allTags.org)) {
				$TagStorage = allTags;
			} else {
				setTimeout(async () => {
					await reloadTags();
				}, 1 * 60 * 1000);
			}
		}
	}

	$: if ($TagStorage) {
		allTags = $TagStorage;
	}

	$: currentTags = $filterStorage[BIZ].tplTag.split(';');
	const dismissPopoverAndGoto = (where) => {
		const popoverList = [].slice.call(document.querySelectorAll('.popover'));
		popoverList.map((popoverEl) => {
			popoverEl.remove();
		});
		goto(where);
	};
	onMount(async () => {
		await reloadTags();
		setTimeout(async () => {
			await reloadTags();
		}, 5 * 60 * 1000);
		import('bootstrap').then((bootstrap) => {
			const popoverTriggerList = [].slice.call(
				document.querySelectorAll('[data-bs-toggle="popover"]'),
			);
			const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
				return new bootstrap.Popover(popoverTriggerEl);
			});
		});
	});
</script>

<div class="d-flex">
	<div class="w-100">
		<Row class="mb-2">
			<Col class="fs-3">
				<Button
					color={currentTags.length === 0 || currentTags[0].length === 0 ? 'primary' : 'light'}
					class={`mx-1 badge  border border-primary ${
						currentTags.length === 0 || currentTags[0].length === 0 ? 'text-white' : 'text-primary'
					}`}
					on:click={(e) => {
						e.preventDefault();
						clearTag();
					}}>
					All
				</Button>
				{#if allTags && allTags.org && Array.isArray(allTags.org)}
					{#each allTags.org as tag}
						<Button
							color={currentTags.includes(tag) ? 'primary' : 'light'}
							class={`mx-1 badge  border border-primary ${
								currentTags.includes(tag) ? 'text-white' : 'text-primary'
							}`}
							on:click={(e) => {
								e.preventDefault();
								useThisTag(tag, e.shiftKey);
							}}>
							{tag}
						</Button>
					{/each}
					<a
						type="button"
						href={'#'}
						on:click|preventDefault={(e) => {
							dismissPopoverAndGoto('settings/tenant');
						}}
						class="btn btn-lg border-0 m-0 p-0"
						data-bs-trigger="hover"
						data-bs-toggle="popover"
						data-bs-placement="top"
						data-bs-title={$_('tips.orgtag.title')}
						data-bs-content={$_('tips.orgtag.content')}>
						<i class="bi bi-question-circle" />
					</a>
				{/if}
			</Col>
		</Row>
		<Row>
			<Col>
				{#if allTags && allTags.mine && Array.isArray(allTags.mine)}
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
							}}>
							{tag}
						</Button>
					{/each}
				{/if}
			</Col>
		</Row>
	</div>
	<div class="flex-shrink-1" />
</div>
