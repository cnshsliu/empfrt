<svelte:options accessors />

<script lang="ts">
	//Row component is optional and only serves to render odd/even row, you can use <tr> instead.
	//Sort component is optional
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { session } from '$app/stores';
	import ItemEditor from './TplSearchResultItemEditor.svelte';
	import AniIcon from '$lib/AniIcon.svelte';
	import { onMount } from 'svelte';
	import Parser from '$lib/parser';
	import { qtb } from '$lib/utils';
	import { SetFor, filterStorage } from '$lib/empstores';
	import { ClientPermControl } from '$lib/clientperm';
	import Table, { Pagination, Search, Sort } from '$lib/pagination/Table.svelte';
	import { goto } from '$app/navigation';
	import {
		Dropdown,
		DropdownItem,
		DropdownMenu,
		NavLink,
		DropdownToggle,
		Icon,
		Container,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Input,
		Button,
		Badge
	} from 'sveltestrap';
	import { getData } from '$lib/pagination/Server.js';

	export let TimeTool;
	export let reloadTags;
	export let endpoint;
	export let rows = [];
	export let user = $session.user;
	export let setFadeMessage;
	let page = 0; //first page
	let pageIndex = 0; //first row
	let pageSize = user && user.ps ? user.ps : 10; //optional, 10 by default

	let loading = true;
	export let rowsCount = 0;
	let filter_author = '';
	let input_search: String = '';
	let sorting = { dir: 'desc', key: 'updatedAt' };
	let storeSorting = $filterStorage.tplSorting;
	if (storeSorting) {
		if (storeSorting.dir && storeSorting.key) {
			sorting = storeSorting;
		} else {
			$filterStorage.tplSorting = sorting;
		}
	}

	export function reset() {
		filter_author = '';
		$filterStorage.author = filter_author;
		input_search = '';
	}
	export async function reload() {
		input_search = $filterStorage.tplTitlePattern;
		await load(page);
	}

	const authorChanged = async function () {
		if (Parser.isEmpty(filter_author)) {
		} else {
			if (filter_author[0] === '@') {
				filter_author = filter_author.substring(1);
			}
			if (filter_author.indexOf('@') < 0) {
				filter_author += user.email.substring(user.email.indexOf('@'));
			}
		}
		$filterStorage.author = filter_author;
		await load(page);
	};
	async function load(_page) {
		loading = true;
		let tagsForFilter = $filterStorage.tplTag.split(';');
		const data = await getData(
			endpoint,
			user.sessionToken,
			_page,
			pageSize,
			input_search,
			sorting,
			{
				tagsForFilter: tagsForFilter,
				author: $filterStorage.author
			}
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
		load(event.detail.page);
		page = event.detail.page;
	}

	async function onSearch(event) {
		input_search = event.detail.text;
		$filterStorage.tplTitlePattern = input_search.toString();
		await load(page);
		page = 0;
	}

	export async function refresh(detail) {
		if (detail && detail.page) page = detail.page;
		if (detail && detail.sorting) sorting = detail.sorting;
		await load(page);
	}

	async function onSort(event) {
		sorting = { dir: event.detail.dir, key: event.detail.key };
		$filterStorage.tplSorting = sorting;
		await load(page);
	}

	let desc_input = '';
	let visi_rds_input = '';

	async function deleteRow(tplid) {
		let res = await api.post('template/delete/byname', { tplid: tplid }, user.sessionToken);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
		} else {
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
	}
	async function exportData(tplid) {
		//let res = await post('/template/data', { tplid: tplid }, user.sessionToken);
	}

	onMount(async () => {
		filter_author = $filterStorage.author;
		if (filter_author === null || filter_author === undefined) {
			filter_author = '';
			$filterStorage.author = filter_author;
		}
	});
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
		<Row cols={{ xs: 1, md: 2 }}>
			<Col>
				<Search on:search={onSearch} text={input_search} />
			</Col>
			<Col>
				<InputGroup>
					<InputGroupText>
						{$_('remotetable.author')}
					</InputGroupText>
					<Input
						class="flex-fill"
						bind:value={filter_author}
						aria-label="Author"
						placeholder="author email"
					/>
					<Button on:click={authorChanged} color="primary">List</Button>
					<Button
						on:click={async () => {
							filter_author = user.email;
							await authorChanged();
						}}
						class="btn-outline-primary m-0 py-1 px-3"
						color={'light'}
					>
						{$_('remotetable.me')}
					</Button>
					<Button
						on:click={async () => {
							filter_author = '';
							await authorChanged();
						}}
						class="btn-outline-primary m-0 py-1 px-3"
						color="light"
					>
						{$_('remotetable.any')}
					</Button>
				</InputGroup>
			</Col>
		</Row>
	</div>
	<thead slot="head">
		<tr>
			<th>
				{$_('remotetable.name')}
				<Sort key="tplid" on:sort={onSort} />
			</th>
			<th>
				{$_('remotetable.author')}
				<Sort key="author" on:sort={onSort} />
			</th>
			<!-- th>
				Updated at
				<Sort key="updatedAt" dir="desc" on:sort={onSort} />
			</th -->
			<th> &nbsp; </th>
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
				<td data-label="Name">
					<a
						class="preview-link kfk-template-id tnt-template-id"
						href="/template/@{row.tplid}&read"
					>
						{row.tplid}
					</a>
				</td>
				<td data-label="Author">
					{row.authorName
						? row.authorName
						: row.author.indexOf('@') > -1
						? row.author.substring(0, row.author.indexOf('@'))
						: row.author}
				</td>
				<td>
					{#if user.perms && ClientPermControl(user.perms, user.email, 'workflow', '', 'create')}
						<a
							href={'#'}
							on:click|preventDefault={() => {
								goto(`template/start?tplid=${row.tplid}`, { replaceState: false });
							}}
							class="nav-link "
						>
							<Icon name="caret-right-square" />
							{$_('remotetable.startIt')}
						</a>
					{:else}
						&nbsp;
					{/if}
				</td>
				<td>
					<Dropdown>
						<DropdownToggle caret color="notexist" class="btn-sm">
							{$_('remotetable.actions')}
						</DropdownToggle>
						<DropdownMenu>
							<DropdownItem>
								{$_('remotetable.tplaction.lastUpdate')}: {TimeTool.format(row.updatedAt, 'lll')}
							</DropdownItem>
							{#if user.perms && ClientPermControl(user.perms, user.email, 'workflow', '', 'create')}
								<DropdownItem>
									<a
										href={'#'}
										on:click|preventDefault={() => {
											goto(`template/start?tplid=${row.tplid}`, { replaceState: false });
										}}
										class="nav-link "
										><Icon name="caret-right-square" />
										{$_('remotetable.tplaction.startIt')}
									</a>
								</DropdownItem>
							{/if}
							<DropdownItem>
								<a
									href={'#'}
									on:click|preventDefault={async () => {
										$filterStorage.tplid = row.tplid;
										goto('/workflow');
									}}
									class="nav-link "
									><Icon name="bar-chart-steps" />
									{$_('remotetable.tplaction.seeWorkflows')}
								</a>
							</DropdownItem>
							<DropdownItem>
								<a
									href={'#'}
									on:click|preventDefault={async () => {
										$filterStorage.tplid = row.tplid;
										goto('/work');
									}}
									class="nav-link "
									><Icon name="bar-chart-steps" />
									{$_('remotetable.tplaction.seeWorklist')}
								</a>
							</DropdownItem>
							{#if user.perms && ClientPermControl(user.perms, user.email, 'template', row, 'delete')}
								<DropdownItem>
									<a
										href={'#'}
										on:click|preventDefault={(e) => {
											e.preventDefault();
											$SetFor.setVisiFor = row.tplid;
											$SetFor.setAuthorFor = row.tplid;
											$SetFor.setDescFor = row.tplid;
											$SetFor.setTagFor = row.tplid;
											$SetFor.settingFor = row.tplid;
											row.checked = false;
											visi_rds_input = row.visi;
										}}
										class="nav-link "
									>
										<Icon name="ui-checks-grid" />
										{$_('remotetable.tplaction.set')}
									</a>
								</DropdownItem>
								<DropdownItem>
									<a
										href={'#'}
										on:click|preventDefault={() => deleteRow(row.tplid)}
										class="nav-link "
										><Icon name="trash" />
										{$_('remotetable.tplaction.deleteThisTempalte')}
									</a>
								</DropdownItem>
								<DropdownItem>
									<a
										href={'#'}
										on:click|preventDefault={() => exportData(row.tplid)}
										class="nav-link "
										><Icon name="trash" />
										{$_('remotetable.tplaction.exportdata')}
									</a>
								</DropdownItem>
							{/if}
						</DropdownMenu>
					</Dropdown>
				</td>
			</tr>
			<tr
				class:kfk-odd={index % 2 !== 0}
				class:kfk-even={index % 2 === 0}
				class:tnt-odd={index % 2 !== 0}
				class:tnt-even={index % 2 === 0}
			>
				<td colspan="4">
					<ItemEditor
						{rows2}
						{row}
						{visi_rds_input}
						{user}
						{index}
						{desc_input}
						{setFadeMessage}
						{reloadTags}
						on:authorSet={(e) => {
							row = e.detail;
							rows2[index] = row;
							$SetFor.setAuthorFor = '';
						}}
					/>
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
