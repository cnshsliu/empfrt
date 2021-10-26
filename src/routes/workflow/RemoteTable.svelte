<script type="ts">
	import * as api from '$lib/api';
	import { scale } from 'svelte/transition';
	import async from 'async';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import { session } from '$app/stores';
	import type { Workflow } from '$lib/types';
	import moment from 'moment';
	import { StatusLabel } from '$lib/lang';
	import Table, { Pagination, Search, Sort } from '$lib/pagination/Table.svelte';
	import { goto } from '$app/navigation';
	import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Icon } from 'sveltestrap';
	import { getData } from '$lib/pagination/Server.js';

	export let token;
	export let payload_extra;
	export let endpoint;
	let rows: Workflow[] = [] as Workflow[];
	let page = 0; //first page
	let pageIndex = 0; //first row
	let pageSize = 10; //optional, 10 by default

	let loading = true;
	let rowsCount = 0;
	let text;
	let sorting = { dir: 'desc', key: 'updatedAt' };

	async function load(_page: number) {
		loading = true;
		const data = await getData(endpoint, token, _page, pageSize, text, sorting, payload_extra);
		rows = data.rows;
		for (let i = 0; i < rows.length; i++) {
			rows[i].status = StatusLabel(rows[i].status);
		}
		rowsCount = data.rowsCount;
		loading = false;
	}

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
		if (detail && detail.payload_extra) payload_extra = detail.payload_extra;
		await load(page);
	}

	async function onSort(event) {
		sorting = { dir: event.detail.dir, key: event.detail.key };
		await load(page);
	}

	const opWorkflow = async function (workflow: Workflow, op: string): Promise<void> {
		if (op === 'startAnother') {
			goto(`/template/start?tplid=${workflow.tplid}`);
			return;
		} else if (op === 'viewTemplate') {
			$session.wfid = workflow.wfid;
			goto(`/template/@${workflow.tplid}&read`);
			return;
		}

		if (op === 'viewInstanceTemplate') {
			let payload = { wfid: workflow.wfid };
			let ret = await api.post('workflow/dump/instemplate', payload, token);
			goto(`template/@${workflow.wfid}_instemplate&read`);
			return;
		}

		let payload = { wfid: workflow.wfid, op: op };
		let ret: Workflow = (await api.post('workflow/op', payload, token)) as Workflow;
		if (op === 'pause' || op === 'resume' || op === 'stop') {
			for (let i = 0; i < rows.length; i++) {
				if (rows[i].wfid === workflow.wfid) {
					rows[i].status = ret.status;
				}
			}
			rows = rows;
		} else if (op === 'destroy') {
			let deletedIndex = -1;
			for (let i = 0; i < rows.length; i++) {
				if (rows[i].wfid === workflow.wfid) {
					deletedIndex = i;
					break;
				}
			}
			if (deletedIndex >= 0) {
				rows.splice(deletedIndex, 1);
				rows = rows;
				rowsCount = rowsCount - 1;
			}
		} else {
			await refresh({});
		}
	};
</script>

<Table {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>
	<div slot="top">
		<Search on:search={onSearch} />
	</div>
	<thead slot="head">
		<tr>
			<th>
				Title
				<Sort key="wftitle" on:sort={onSort} />
			</th>
			<th>
				Status
				<Sort key="status" on:sort={onSort} />
			</th>
			<th>
				Starter
				<Sort key="starter" on:sort={onSort} />
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
				animate:flip={{ duration: 1000 }}
				class:odd={index % 2 !== 0}
				class:even={index % 2 === 0}
			>
				<td data-label="Title">
					<a class="preview-link kfk-template-id" href="/workflow/@{row.wfid}">
						{row.wftitle}
					</a>
				</td>
				<td data-label="Status">{row.status}</td>
				<td data-label="Starter">{row.starter}</td>
				<td data-label="Updated at">{moment(row.updatedAt).format('LLLL')}</td>
				<td>
					<Dropdown>
						<DropdownToggle caret color="notexist" class="btn-sm">Actions</DropdownToggle>
						<DropdownMenu>
							<DropdownItem>
								{#if row.status === 'ST_RUN'}
									<a
										class="nav-link"
										href={'#'}
										on:click|preventDefault={() => opWorkflow(row, 'pause')}
									>
										<Icon name="play-circle-fill" /> Pause
									</a>
								{:else if row.status === 'ST_PAUSE'}
									<a
										class="nav-link"
										href={'#'}
										on:click|preventDefault={() => opWorkflow(row, 'resume')}
									>
										<Icon name="play-circle-fill" /> Resume
									</a>
								{/if}
							</DropdownItem>
							<DropdownItem>
								<a
									href={'#'}
									on:click|preventDefault={() => opWorkflow(row, 'startAnother')}
									class="nav-link "
									><Icon name="trash" />
									Start Another
								</a>
							</DropdownItem>
							<DropdownItem>
								<a
									href={'#'}
									on:click|preventDefault={() => opWorkflow(row, 'viewTemplate')}
									class="nav-link "
									><Icon name="trash" />
									View Template
								</a>
							</DropdownItem>
							<DropdownItem>
								<a
									href={'#'}
									on:click|preventDefault={() => opWorkflow(row, 'viewInstanceTemplate')}
									class="nav-link "
									><Icon name="trash" />
									View Instance Template
								</a>
							</DropdownItem>
							<DropdownItem>
								<a
									href={'#'}
									on:click|preventDefault={() => opWorkflow(row, 'destroy')}
									class="nav-link "
									><Icon name="trash" />
									Delete this workflow
								</a>
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
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
