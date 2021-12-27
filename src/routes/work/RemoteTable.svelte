<script type="ts">
	import * as api from '$lib/api';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { filterStore } from '$lib/empstores';
	import { onMount } from 'svelte';
	import { StatusLabel } from '$lib/lang';
	import type { Workflow, Work } from '$lib/types';
	import Table, { Pagination, Search, Sort } from '$lib/pagination/Table.svelte';
	import { goto } from '$app/navigation';
	import { Button, InputGroup, Icon } from 'sveltestrap';
	import { getData } from '$lib/pagination/Server.js';

	export let token;
	export let iframeMode;
	export let endpoint;
	export let payload_extra;
	export let TimeTool;
	let rows = [];
	let page = 0; //first page
	let pageIndex = 0; //first row
	let pageSize = 10; //optional, 10 by default

	let loading = true;
	let rowsCount = 0;
	let input_search;
	let sorting = { dir: 'desc', key: 'lastdays' };
	let storeSorting = $filterStore.workSorting;
	if (storeSorting) {
		if (storeSorting.dir && storeSorting.key) {
			sorting = storeSorting;
		} else {
			$filterStore.workSorting = sorting;
		}
	}

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
		console.log('load', payload_extra);
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
		$filterStore.workTitlePattern = input_search;
		await load(page, 'onSearch');
		page = 0;
	}

	export async function refresh(detail) {
		if (detail && detail.page) page = detail.page;
		if (detail && detail.sorting) sorting = detail.sorting;
		if (detail && detail.payload_extra) payload_extra = detail.payload_extra;
		await load(page, 'refresh');
	}

	export function reset() {
		input_search = '';
	}
	export function reload() {
		input_search = $filterStore.workTitlePattern;
	}

	onMount(async () => {
		reload();
	});

	async function onSort(event) {
		sorting = { dir: event.detail.dir, key: event.detail.key };
		$filterStore.workSorting = sorting;
		await load(page, 'onSort');
	}
	function gotoWorkitem(work: Work) {
		goto(iframeMode ? `/work/@${work.todoid}?iframe` : `/work/@${work.todoid}`, {
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
				Status
				<Sort key="status" on:sort={onSort} />
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
						<sup>
							{#if row.nodeid === 'ADHOC'}
								/ adhoc
							{/if}
							{#if row.rehearsal}
								/ <i class="bi-patch-check" />
								{row.doer}
							{/if}
						</sup>
					</a>
					<br />
					<span style="font-size:0.5rem; margin-left:2em; ">
						<a
							class="kfk-link"
							href={'#'}
							on:click={(e) => {
								e.preventDefault();
								gotoWorkflow(row.wfid);
							}}
						>
							<Icon name="bar-chart-steps" style="font-size:0.5rem" />
							{row.wftitle}
							- {StatusLabel(row.wfstatus)}
						</a>
					</span>
				</td>
				<td data-label="Status" style="font-size:0.25rem">
					{StatusLabel(row.status)}
				</td>
				<td data-label="Date" style="font-size:0.25rem">
					<div>
						<div>{row.doneat ? 'Done at ' + TimeTool.format(row.doneat, 'LLL') : ''}</div>
						<div>Begin at {TimeTool.format(row.createdAt, 'LLL')}</div>
					</div>
				</td>
				<td class="kfk-lastdays">
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
