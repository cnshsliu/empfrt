<script context="module" type="ts">
	let globalLabels;

	export function setLabels(labels) {
		globalLabels = labels;
	}
</script>

<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { StateContext } from '$lib/types';
	import { createEventDispatcher, getContext } from 'svelte';
	const dispatch = createEventDispatcher();
	const stateContext: StateContext = getContext('state');

	export let buttons = [-2, -1, 0, 1, 2];
	export let count;
	export let page = 0;
	export let pageSize;
	export let isMobile = false;
	let pageCount;

	export let labels = {
		first: $_('pagination.first'),
		last: $_('pagination.last'),
		next: $_('pagination.next'),
		previous: $_('pagination.prev'),
		...globalLabels,
	};

	$: count &&
		(() => {
			pageCount = Math.ceil(count / pageSize);
		})();
	pageCount = Math.ceil(count / pageSize);

	function onChange(event, page) {
		const state = stateContext.getState();
		const detail = {
			originalEvent: event,
			page,
			pageSize: state.pageSize,
			preventDefault: event.preventDefault,
		};
		dispatch('pageChange', detail);

		if (detail.preventDefault !== true) {
			stateContext.setPage(detail.page);
		}
	}
</script>

{#if isMobile === false}
	{$_('remotetable.totalRows')}: {count}
	{$_('remotetable.pageSize')}: {pageSize}
	{$_('remotetable.pageCount')}: {pageCount}
{/if}
{#key page}
	<ul class="p-0">
		<li>
			<button disabled={page === 0} on:click={(e) => onChange(e, 0)}>
				{labels.first}
			</button>
		</li>
		<li>
			<button disabled={page === 0} on:click={(e) => onChange(e, page - 1)}>
				{labels.previous}
			</button>
		</li>
		{#each buttons as button}
			{#if page + button >= 0 && page + button + 1 <= pageCount}
				<li>
					<button
						class:active={page === page + button}
						on:click={(e) => onChange(e, page + button)}>
						{page + button + 1}
					</button>
				</li>
			{/if}
		{/each}
		<li>
			<button disabled={page >= pageCount - 1} on:click={(e) => onChange(e, page + 1)}>
				{labels.next}
			</button>
		</li>
		<li>
			<button disabled={page >= pageCount - 1} on:click={(e) => onChange(e, pageCount - 1)}>
				{labels.last}
			</button>
		</li>
	</ul>
{/key}

<style>
	.active {
		background-color: rgb(150, 150, 235);
		color: white;
	}

	ul {
		flex: 1;
		float: right;
		list-style: none;
	}

	li {
		float: left;
	}

	button {
		background: transparent;
		border: 1px solid #ccc;
		padding: 1px 10px;
		margin-left: 3px;
		float: left;
		cursor: pointer;
	}
</style>
