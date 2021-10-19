<script type="ts">
	import * as api from '$lib/api';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import type { Workflow } from '$lib/types';
	import moment from 'moment';
	import Table, { Pagination, Search, Sort } from '$lib/pagination/Table.svelte';
	import { goto } from '$app/navigation';
	import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Icon } from 'sveltestrap';
	import { getData } from '$lib/pagination/Server.js';

	export let token;
	export let endpoint;
	let rows = [];
	let page = 0; //first page
	let pageIndex = 0; //first row
	let pageSize = 10; //optional, 10 by default

	let loading = true;
	let rowsCount = 0;
	let text;
	let sorting = { dir: 'desc', key: 'updatedAt' };

	onMount(async () => {
		await load(page);
	});

	async function load(_page) {
		loading = true;
		const data = await getData(endpoint, token, _page, pageSize, text, sorting);
		rows = data.rows;
		rowsCount = data.rowsCount;
		loading = false;
	}

	export const unshiftRows = function (obj) {
		rows = [obj, ...rows];
		rowsCount = rowsCount + 1;
	};

	function onPageChange(event) {
		load(event.detail.page);
		page = event.detail.page;
	}

	async function onSearch(event) {
		text = event.detail.text;
		await load(page);
		page = 0;
	}

	export async function refresh(detail) {
		if (detail && detail.text) text = detail.text;
		if (detail && detail.page) page = detail.page;
		if (detail && detail.sorting) sorting = detail.sorting;
		await load(page);
	}

	async function onSort(event) {
		sorting = { dir: event.detail.dir, key: event.detail.key };
		await load(page);
	}
	function gotoWorkitem(work: Work) {
		goto(`/work/@${work.workid}`, { replaceState: false });
	}
</script>

<Table {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>
	<div slot="top">
		<Search on:search={onSearch} />
	</div>
	<thead slot="head">
		<tr>
			<th>
				Title
				<Sort key="title" on:sort={onSort} />
			</th>
			<th>
				Updated at
				<Sort key="updatedAt" dir="desc" on:sort={onSort} />
			</th>
			<th> &nbsp; </th>
		</tr>
	</thead>
	<tbody>
		{#each rows2 as row, index (row)}
			<tr
				transition:scale|local={{ start: 0.7 }}
				animate:flip={{ duration: 200 }}
				class:odd={index % 2 !== 0}
				class:even={index % 2 === 0}
			>
				<td data-label="Title">
					<a
						class="preview-link kfk-team-id kfk-link"
						href={'#'}
						on:click|preventDefault={() => {
							gotoWorkitem(row);
						}}
					>
						{row.title}
					</a> <br />
					of
					<a
						class="kfk-link"
						href={'#'}
						on:click={() => {
							goto(`/workflow/@${row.wfid}`);
						}}
					>
						<b> {row.wftitle} </b>
					</a>
					started by
					{row.wfstarter ? row.wfstarter : ''}
				</td>
				<td data-label="Status">
					set: {moment(row.createdAt).format('LLLL')} <br />
					done: {row.doneat ? moment(row.doneat).format('LLLL') : ''}
				</td>
			</tr>
		{/each}
	</tbody>
	<div slot="bottom">
		<Pagination
			{page}
			{pageSize}
			count={rowsCount}
			serverSide={true}
			on:pageChange={onPageChange}
		/>
	</div>
</Table>

<style>
	.odd {
		background-color: #f7f7f7;
	}
</style>
