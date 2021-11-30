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
	export let iframeMode;
	export let endpoint;
	export let payload_extra;
	let rows = [];
	let page = 0; //first page
	let pageIndex = 0; //first row
	let pageSize = 10; //optional, 10 by default

	let loading = true;
	let rowsCount = 0;
	export let input_search;
	let sorting = { dir: 'desc', key: 'lastdays' };

	onMount(async () => {});

	async function load(_page, reason) {
		loading = true;
		const data = await getData(
			endpoint,
			token,
			_page,
			pageSize,
			input_search,
			sorting,
			payload_extra
		);
		rows = data.rows;
		rowsCount = data.rowsCount;
		loading = false;
	}

	export const unshiftRows = function (obj) {
		rows = [obj, ...rows];
		rowsCount = rowsCount + 1;
	};

	function onPageChange(event) {
		load(event.detail.page, 'onPageChange');
		page = event.detail.page;
	}

	async function onSearch(event) {
		input_search = event.detail.text;
		await load(page, 'onSearch');
		page = 0;
	}

	export async function refresh(detail) {
		if (detail && detail.input_search) input_search = detail.input_search;
		if (detail && detail.page) page = detail.page;
		if (detail && detail.sorting) sorting = detail.sorting;
		if (detail && detail.payload_extra) payload_extra = detail.payload_extra;
		await load(page, 'refresh');
	}

	async function onSort(event) {
		sorting = { dir: event.detail.dir, key: event.detail.key };
		await load(page, 'onSort');
	}
	function gotoWorkitem(work: Work) {
		goto(iframeMode ? `/work/@${work.workid}?iframe` : `/work/@${work.workid}`, {
			replaceState: false
		});
	}
	function gotoWorkflow(wfid: string) {
		goto(iframeMode ? `/workflow/@${wfid}?iframe` : `/workflow/@${wfid}`, { replaceState: false });
	}
</script>

<Table hover {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>
	<div slot="top">
		<Search on:search={onSearch} text={input_search} />
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
			<th>
				Lasting days
				<Sort key="lastdays" dir="desc" on:sort={onSort} />
			</th>
			<th> &nbsp; </th>
		</tr>
	</thead>
	<tbody>
		{#each rows2 as row, index (row)}
			<tr
				class:kfk-odd={index % 2 !== 0}
				class:kfk-even={index % 2 === 0}
				class:tnt-odd={index % 2 !== 0}
				class:tnt-even={index % 2 === 0}
			>
				<td data-label="Title">
					<a
						class="preview-link   kfk-work-id tnt-work-id"
						href={'#'}
						on:click|preventDefault={(e) => {
							e.preventDefault();
							gotoWorkitem(row);
						}}
					>
						{row.title}
					</a> <br />
					<span style="font-size:0.5rem; margin-left:2em; ">
						<Icon name="bar-chart-steps" style="font-size:0.5rem" />
						<a
							class="kfk-link"
							href={'#'}
							on:click={(e) => {
								e.preventDefault();
								gotoWorkflow(row.wfid);
							}}
						>
							{row.wftitle}
						</a>
						({row.wfstarter ? row.wfstarter : ''})
					</span>
				</td>
				<td data-label="Status" style="font-size:0.25rem" valign="bottom">
					<div>
						Begin at {moment(row.createdAt).format('LLLL')} <br />
						{row.doneat ? 'Done at ' + moment(row.doneat).format('LLLL') : row.status}
					</div>
				</td>
				<td class="kfk-lastdays" valign="bottom">
					{row.lastdays}
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
