<svelte:options accessors />

<script type="ts">
	import { _, date, time } from '$lib/i18n';
	import * as api from '$lib/api';
	import { session } from '$app/stores';
	import { filterStorage } from '$lib/empstores';
	import { tspans } from '$lib/variables';
	import { onMount } from 'svelte';
	import Parser from '$lib/parser';
	import { StatusLabel } from '$lib/status';
	import type { Workflow, Work } from '$lib/types';
	import Table, { Pagination, Search, Sort } from '$lib/pagination/Table.svelte';
	import { goto } from '$app/navigation';
	import { Row, Col, Button, InputGroup, InputGroupText, Input, Icon } from 'sveltestrap';
	import { getData } from '$lib/pagination/Server.js';

	export let token;
	export let iframeMode;
	export let endpoint;
	let rows = [];
	let page = 0; //first page
	let pageIndex = 0; //first row
	let pageSize = 10; //optional, 10 by default

	let loading = true;
	let rowsCount = 0;
	let input_search;
	let filter_tspan = '1w';
	let show_calendar_select = false;
	let calendar_begin = '';
	let calendar_end = '';
	let sorting = { dir: 'desc', key: 'lastdays' };
	let storeSorting = $filterStorage.workSorting;
	let user = $session.user;

	$filterStorage.calendar_begin = '';
	$filterStorage.calendar_end = '';
	if (storeSorting) {
		if (storeSorting.dir && storeSorting.key) {
			sorting = storeSorting;
		} else {
			$filterStorage.workSorting = sorting;
		}
	}
	let storeTspan = $filterStorage.tspan;
	if (storeTspan && Object.keys(tspans).includes(storeTspan)) {
		filter_tspan = storeTspan;
	} else {
		filter_tspan = '1w';
		$filterStorage.tspan = filter_tspan;
	}

	async function load(_page, reason) {
		loading = true;
		let fltSt = $filterStorage;
		let payload_extra = {
			status: fltSt.workStatus,
			doer: fltSt.doer,
			tspan: fltSt.tspan
		};
		if (fltSt.tplTag) {
			payload_extra['tagsForFilter'] = fltSt.tplTag.split(';');
		}
		if (fltSt.tplid && fltSt.tplid.trim().length > 0) {
			payload_extra['tplid'] = fltSt.tplid.trim();
		}
		if (Parser.hasValue(fltSt.calendar_begin) && Parser.hasValue(fltSt.calendar_end)) {
			payload_extra['calendar_begin'] = fltSt.calendar_begin;
			payload_extra['calendar_end'] = fltSt.calendar_end;
		}

		const data = await getData(
			endpoint,
			token,
			_page,
			pageSize,
			input_search,
			sorting,
			payload_extra
		);
		if (data && data.rows) {
			rows = data.rows;
			rowsCount = data.rowsCount;
		} else {
			console.warn(JSON.stringify(data));
		}
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

	const calendar_changed = function () {
		if (Parser.hasValue(calendar_begin) && Parser.isEmpty(calendar_end)) {
			calendar_end = calendar_begin;
		}
		if (Parser.hasValue(calendar_begin) && Parser.hasValue(calendar_end)) {
			$filterStorage.calendar_begin = calendar_begin;
			$filterStorage.calendar_end = calendar_end;
			refresh(null);
		}
	};

	async function onSearch(event) {
		input_search = event.detail.text;
		$filterStorage.workTitlePattern = input_search;
		await load(page, 'onSearch');
		page = 0;
	}

	export async function refresh(detail) {
		if (detail && detail.page) page = detail.page;
		if (detail && detail.sorting) sorting = detail.sorting;
		await load(page, 'refresh');
	}

	export function reset() {
		input_search = '';
	}
	export function reload() {
		input_search = $filterStorage.workTitlePattern;
	}

	onMount(async () => {
		reload();
	});

	async function onSort(event) {
		sorting = { dir: event.detail.dir, key: event.detail.key };
		$filterStorage.workSorting = sorting;
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
	$: if ($filterStorage) {
		filter_tspan = $filterStorage.tspan;
	}
</script>

<Table hover {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>
	<div slot="top">
		<Row cols={{ xs: 1, md: 2 }} class="mt-1">
			<Col>
				<Search on:search={onSearch} text={input_search} />
			</Col>
			<Col>
				<InputGroup>
					<InputGroupText>
						{$_('remotetable.in')}
					</InputGroupText>
					<Input
						type="select"
						id="timespanSelect"
						bind:value={filter_tspan}
						on:change={async (e) => {
							e.preventDefault();
							filter_tspan = e.target.value;
							$filterStorage.tspan = filter_tspan;
							await load(page, 'onTspan');
						}}
					>
						{#each Object.keys(tspans) as key}
							<option value={key}>{tspans[key]}</option>
						{/each}
					</Input>
					<Button
						on:click={() => {
							if (show_calendar_select) {
								calendar_begin = '';
								calendar_end = '';
								$filterStorage.calendar_begin = calendar_begin;
								$filterStorage.calendar_end = calendar_end;
								show_calendar_select = false;
								refresh(null);
							} else {
								show_calendar_select = true;
							}
						}}
					>
						<i class="bi bi-calendar4-week" />
					</Button>
				</InputGroup>
			</Col>
		</Row>
		{#if show_calendar_select}
			<Row cols={{ xs: 1, md: 2 }} class="mt-1">
				<Col>
					<InputGroup>
						<InputGroupText>Begin:</InputGroupText>
						<Input type="date" bind:value={calendar_begin} on:change={calendar_changed} />
					</InputGroup>
				</Col>
				<Col>
					<InputGroup>
						<InputGroupText>End:</InputGroupText>
						<Input type="date" bind:value={calendar_end} on:change={calendar_changed} />
						<Button on:click={calendar_changed} color="primary">
							<i class="bi bi-arrow-return-left" />
						</Button>
					</InputGroup>
				</Col>
			</Row>
		{/if}
	</div>
	<thead slot="head">
		<tr>
			<th>
				{$_('remotetable.title')}
				<Sort key="title" on:sort={onSort} />
			</th>
			<th>
				{$_('remotetable.status')}
				<Sort key="status" on:sort={onSort} />
			</th>
			<th>
				{$_('remotetable.updatedAt')}
				<Sort key="updatedAt" dir="desc" on:sort={onSort} />
			</th>
			<th>
				{$_('remotetable.lastingDays')}
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
								/ <i class="bi-patch-check-fill" />
								{Parser.userDisplay(row.doer, user.email)}
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
							- {$_('status.' + row.wfstatus)}
						</a>
					</span>
				</td>
				<td data-label="Status" style="font-size:0.25rem">
					{$_('status.' + row.status)}
				</td>
				<td data-label="Date" style="font-size:0.25rem">
					<div>
						{#if row.doneat}
							{$date(new Date(row.doneat))}
							{$time(new Date(row.doneat))}
						{:else}
							{$date(new Date(row.createdAt))}
							{$time(new Date(row.createdAt))}
						{/if}
					</div>
				</td>
				<td class="kfk-lastdays">
					{row.lastdays}
				</td>
			</tr>
		{/each}
	</tbody>
	<div slot="bottom">
		{$_('remotetable.totalRows')}: {rowsCount}
		{$_('remotetable.pageSize')}: {pageSize}
		<Pagination
			{page}
			{pageSize}
			count={rowsCount}
			serverSide={true}
			on:pageChange={onPageChange}
		/>
	</div>
</Table>
