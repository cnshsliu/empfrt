<svelte:options accessors />

<script>
	//Row component is optional and only serves to render odd/even row, you can use <tr> instead.
	//Sort component is optional
	import * as api from '$lib/api';
	import { scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import Table from '$lib/pagination/Table.svelte';
	import Pagination from '$lib/pagination/Pagination.svelte';
	import Search from '$lib/pagination/Search.svelte';
	import Sort from '$lib/pagination/Sort.svelte';
	import { goto } from '$app/navigation';
	import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Icon } from 'sveltestrap';
	import { getData } from '$lib/pagination/Server';
	import { ClientPermControl } from '$lib/clientperm';

	export let token;
	export let endpoint;
	export let rows = [];
	export let user;
	export let TimeTool;
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

	async function deleteRow(tid) {
		await api.post('team/delete', { teamid: tid }, token);
		let deletedIndex = -1;
		for (let i = 0; i < rows.length; i++) {
			if (rows[i].teamid === tid) {
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
</script>

<Table {loading} {rows} {pageIndex} {pageSize} let:rows={rows2}>
	<div slot="top">
		<Search on:search={onSearch} />
	</div>
	<thead slot="head">
		<tr>
			<th>
				Name
				<Sort key="teamid" on:sort={onSort} />
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
					<a class="preview-link kfk-team-id tnt-team-id" href="/team/@{row.teamid}">
						{row.teamid}
					</a>
				</td>
				<td data-label="Author">{row.author}</td>
				<td data-label="Updated at">{TimeTool.format(row.updatedAt, 'LLLL')}</td>
				<td>
					{#if user.perms && ClientPermControl(user.perms, user.email, 'team', row, 'delete')}
						<Dropdown>
							<DropdownToggle caret color="notexist" class="btn-sm">Actions</DropdownToggle>
							<DropdownMenu>
								<DropdownItem>
									<a
										href={'#'}
										on:click|preventDefault={() => deleteRow(row.teamid)}
										class="nav-link "
										><Icon name="trash" />
										Delete this team
									</a>
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					{/if}
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
