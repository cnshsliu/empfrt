<script context="module">
	let globalLabels;

	export function setLabels(labels) {
		globalLabels = labels;
	}
</script>

<script>
	import { _ } from '$lib/i18n';
	import { createEventDispatcher, getContext } from 'svelte';
	import { Button, InputGroup, InputGroupText, Icon } from 'sveltestrap';

	const dispatch = createEventDispatcher();
	const stateContext = getContext('state');
	let searchTimer = undefined;

	export let filter = (row, text, index) => {
		text = text.toLowerCase();
		for (let i in row) {
			if (row[i].toString().toLowerCase().indexOf(text) > -1) {
				return true;
			}
		}
		return false;
	};
	export let index = -1;
	export let text = '';

	export let labels = {
		placeholder: $_('remotetable.bywhat'),
		...globalLabels
	};

	async function onSearch(event) {
		const state = stateContext.getState();
		const detail = {
			originalEvent: event,
			filter,
			index,
			text,
			page: state.page,
			pageIndex: state.pageIndex,
			pageSize: state.pageSize,
			rows: state.filteredRows
		};
		searchTimer && clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			dispatch('search', detail);

			if (detail.preventDefault !== true) {
				if (detail.text.length === 0) {
					stateContext.setRows(state.rows);
				} else {
					stateContext.setRows(detail.rows.filter((r) => detail.filter(r, detail.text, index)));
				}
				stateContext.setPage(0, 0);
			} else {
				stateContext.setRows(detail.rows);
			}
			searchTimer = undefined;
		}, 500);
	}
</script>

<div class="search d-flex">
	<InputGroup>
		<InputGroupText
			><Icon name="funnel" />
			{$_('remotetable.filter')}
		</InputGroupText>
		<input
			class="flex-fill"
			type="search"
			title={labels.placeholder}
			placeholder={labels.placeholder}
			bind:value={text}
			on:input={onSearch}
		/>
	</InputGroup>
</div>

<style>
	.search input {
		border: 1px solid #eee;
		border-radius: 3px;
		padding: 5px 3px;
	}
</style>
