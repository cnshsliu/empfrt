<script type="ts">
	import { onMount } from 'svelte';
	import { _ } from '$lib/i18n';
	import { savedSearches, lastQuery } from '$lib/Stores';
	import { session } from '$app/stores';
	import { createEventDispatcher, getContext, setContext } from 'svelte';
	import * as api from '$lib/api';
	import { mtcSearchCondition, mtcConfirm, mtcConfirmReset } from './Stores';

	export let objtype;
	export let aSsPicked;
	const dispatch = createEventDispatcher();
	let user = $session.user;
	let showSaveSearchForm = false;
	let newSsName = '';

	onMount(async () => {
		$savedSearches[objtype] = await api.post(
			'savedsearch/list',
			{ objtype: objtype },
			user.sessionToken,
			api.CACHE_FLAG.useIfExists,
		);
	});

	const saveSearch = async () => {
		api
			.post(
				'savedsearch/save',
				{ objtype: objtype, name: newSsName, ss: JSON.stringify($lastQuery[objtype]) },
				user.sessionToken,
			)
			.then((res) => {
				$savedSearches[objtype] = $savedSearches[objtype].filter((x) => x !== res);
				$savedSearches[objtype].unshift(res);
				$savedSearches = $savedSearches;
			});
		showSaveSearchForm = false;
		newSsName = '';
	};

	const useSearch = async () => {
		dispatch(
			'searchlet',
			await api.post(
				'savedsearch/getone',
				{ objtype: objtype, name: aSsPicked },
				user.sessionToken,
			),
		);
	};
	const resetSearchlet = async () => {
		$savedSearches[objtype] = await api.post(
			'savedsearch/list',
			{ objtype: objtype },
			user.sessionToken,
			api.CACHE_FLAG.preDelete,
		);
		dispatch('resetSearchlet', '');
	};
</script>

<div class="row">
	<div class="input-group">
		<div class="input-group-text">
			{$_('searchlet.existing')}
		</div>
		{#if $savedSearches[objtype].length > 0}
			<select
				class="form-control"
				bind:value={aSsPicked}
				type="select"
				on:change={(e) => {
					if (aSsPicked !== '---PLS_PICK_ONE---') useSearch();
					else {
						resetSearchlet();
					}
				}}>
				<option value={'---PLS_PICK_ONE---'}>{$_('searchlet.pick')}</option>
				{#each $savedSearches[objtype] as aSS}
					<option value={aSS}>{aSS}</option>
				{/each}
			</select>
		{:else}
			<select class="form-control" />
		{/if}
		<div
			class="btn btn-primary ms-3"
			on:click|preventDefault={(e) => {
				showSaveSearchForm = true;
			}}>
			{$_('searchlet.new')}
		</div>
		<div class="btn btn-secondary" on:click|preventDefault={resetSearchlet}>
			{$_('searchlet.reset')}
		</div>
	</div>
</div>
{#if showSaveSearchForm}
	<div class="row mt-1">
		<div class="input-group">
			<div class="input-group-text">
				{$_('searchlet.new')}
			</div>
			<input class="form-control" bind:value={newSsName} placeholder={$_('searchlet.nameit')} />
			<div class="btn btn-primary" on:click|preventDefault={saveSearch}>
				{$_('searchlet.save')}
			</div>
			<div
				class="btn btn-secondary"
				on:click|preventDefault={(e) => {
					showSaveSearchForm = false;
				}}>
				{$_('searchlet.cancel')}
			</div>
		</div>
	</div>
{/if}
