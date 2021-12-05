<svelte:options accessors />

<script lang="ts">
	//Row component is optional and only serves to render odd/even row, you can use <tr> instead.
	//Sort component is optional
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import { ClientPermControl } from '$lib/clientperm';
	import Table, { Pagination, Search, Sort } from '$lib/pagination/Table.svelte';
	import { goto } from '$app/navigation';
	import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Icon } from 'sveltestrap';
	import { getData } from '$lib/pagination/Server.js';

	export let TimeTool;
	export let token;
	export let endpoint;
	export let rows = [];
	export let user;
	let page = 0; //first page
	let pageIndex = 0; //first row
	let pageSize = 10; //optional, 10 by default

	let loading = true;
	export let rowsCount = 0;
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

	async function deleteRow(tplid) {
		await api.post('template/delete/byname', { tplid: tplid }, token);
		let deletedIndex = -1;
		for (let i = 0; i < rows.length; i++) {
			if (rows[i].tplid === tplid) {
				deletedIndex = i;
				break;
			}
		}
		if (deletedIndex >= 0) {
			rows.splice(deletedIndex, 1);
			rows = rows;
			rowsCount = rowsCount - 1;
		}
	}
	/*
<code>
	<pre>
		How to use RemoteTable Pagination 
		1. Copy RemoteTable.svelet to object folder
			(team/template/workflow/work etc.) 
			2.1. modify deleteRow to match API endpoint and payload 
		2. Do following modification to RemoteTable.svelte 
			2.2. modify link href of object in remote table row
			2.3. modify link hrefs in DropDown
			3. in index.svelete, change "RemoteTable endpoint" to the correct one. 
			4. modify object search method in handlers.js on server side to return objs and total number of objs. Reference to TemplateSearch
	</pre>
</code>
*/
</script>

<Table {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>
	<div slot="top">
		<Search on:search={onSearch} />
	</div>
	<thead slot="head">
		<tr>
			<th>
				Name
				<Sort key="tplid" on:sort={onSort} />
			</th>
			<th>
				Author
				<Sort key="author" on:sort={onSort} />
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
				class:kfk-odd={index % 2 !== 0}
				class:kfk-even={index % 2 === 0}
				class:tnt-odd={index % 2 !== 0}
				class:tnt-even={index % 2 === 0}
			>
				<td data-label="Name">
					<a
						class="preview-link kfk-template-id tnt-template-id"
						href="/template/@{row.tplid}&read"
					>
						{row.tplid}
					</a>
				</td>
				<td data-label="Author">{row.author}</td>
				<td data-label="Updated at">{TimeTool.format(row.updatedAt, 'LLLL')}</td>
				<td>
					<Dropdown>
						<DropdownToggle caret color="notexist" class="btn-sm">Actions</DropdownToggle>
						<DropdownMenu>
							{#if user.perms && ClientPermControl(user.perms, user.email, 'workflow', '', 'create')}
								<DropdownItem>
									<a
										href={'#'}
										on:click|preventDefault={() => {
											goto(`template/start?tplid=${row.tplid}`, { replaceState: false });
										}}
										class="nav-link "
										><Icon name="caret-right-square" />
										Start it
									</a>
								</DropdownItem>
							{/if}
							<DropdownItem>
								<a
									href={'#'}
									on:click|preventDefault={() => {
										goto(`workflow?tplid=${row.tplid}`);
									}}
									class="nav-link "
									><Icon name="bar-chart-steps" />
									See workflows
								</a>
							</DropdownItem>
							{#if user.perms && ClientPermControl(user.perms, user.email, 'template', row, 'delete')}
								<DropdownItem>
									<a
										href={'#'}
										on:click|preventDefault={() => deleteRow(row.tplid)}
										class="nav-link "
										><Icon name="trash" />
										Delete this template
									</a>
								</DropdownItem>
							{/if}
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
