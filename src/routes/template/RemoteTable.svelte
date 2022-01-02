<svelte:options accessors />

<script lang="ts">
	//Row component is optional and only serves to render odd/even row, you can use <tr> instead.
	//Sort component is optional
	import { _ } from '$lib/i18n';
	import { scale } from 'svelte/transition';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	import Parser from '$lib/parser';
	import { session } from '$app/stores';
	import { filterStorage } from '$lib/empstores';
	import { ClientPermControl } from '$lib/clientperm';
	import Table, { Pagination, Search, Sort } from '$lib/pagination/Table.svelte';
	import { goto } from '$app/navigation';
	import {
		Dropdown,
		DropdownItem,
		DropdownMenu,
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
	export let token;
	export let endpoint;
	export let rows = [];
	export let user;
	let page = 0; //first page
	let pageIndex = 0; //first row
	let pageSize = user && user.ps ? user.ps : 10; //optional, 10 by default

	let loading = true;
	export let rowsCount = 0;
	let setTagForTplid = '';
	let filter_author = '';
	let addDescForTplid = '';
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
		const data = await getData(endpoint, token, _page, pageSize, input_search, sorting, {
			tagsForFilter: tagsForFilter,
			author: $filterStorage.author
		});
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

	let tag_input = '';
	let desc_input = '';
	const deleteATag = async function (index, tplid, tags, text) {
		tags = await api.post('tag/del', { objtype: 'template', objid: tplid, text: text }, token);
		rows[index].tags = tags;
		rows = rows;
		await reloadTags();
	};

	const addDesc = async function (index, tplid, desc) {
		desc = desc.trim();
		let ret = await api.post('template/desc', { tplid: tplid, desc: desc }, token);
		rows[index].desc = desc;
		rows = rows;
	};
	const addTags = async function (index, tplid, tags, text) {
		if (text.trim().length === 0) return;
		tags = await api.post('tag/add', { objtype: 'template', objid: tplid, text: text }, token);
		console.log('ret', tags);
		rows[index].tags = tags;
		rows = rows;
		await reloadTags();
	};

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
						color="secondary"
					>
						{$_('remotetable.me')}
					</Button>
					<Button
						on:click={async () => {
							filter_author = '';
							await authorChanged();
						}}
						color="secondary"
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
				transition:scale|local={{ start: 0.7 }}
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
				<td data-label="Author"
					>{row.author.indexOf('@') > -1
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
							<DropdownItem>
								<a
									href={'#'}
									on:click|preventDefault={() => {
										desc_input = row.desc;
										addDescForTplid = row.tplid;
									}}
									class="nav-link "
								>
									<Icon name="tags" />
									{$_('remotetable.tplaction.addDesc')}
								</a>
							</DropdownItem>
							<DropdownItem>
								<a
									href={'#'}
									on:click|preventDefault={() => {
										setTagForTplid = row.tplid;
									}}
									class="nav-link "
								>
									<Icon name="tags" />
									{$_('remotetable.tplaction.setTags')}
								</a>
							</DropdownItem>
							{#if user.perms && ClientPermControl(user.perms, user.email, 'template', row, 'delete')}
								<DropdownItem>
									<a
										href={'#'}
										on:click|preventDefault={() => deleteRow(row.tplid)}
										class="nav-link "
										><Icon name="trash" />
										{$_('remotetable.tplaction.deleteThisTempalte')}
									</a>
								</DropdownItem>
							{/if}
						</DropdownMenu>
					</Dropdown>
				</td>
			</tr>
			{#if row.desc && row.desc.trim().length > 0}
				<tr>
					<td colspan="4"><div class="ms-5">{row.desc}</div> </td>
				</tr>
			{/if}
			{#if addDescForTplid === row.tplid}
				<tr>
					<td colspan="4">
						<Container>
							<Row>
								<InputGroup>
									<div class="form-floating flex-fill">
										<input
											class="form-control"
											id={'input-desc-' + index}
											placeholder="Description"
											bind:value={desc_input}
										/>
										<label for={`input-desc-${index}`}> set description to: </label>
									</div>
									<Button
										color="primary"
										on:click={async (e) => {
											e.preventDefault();
											await addDesc(index, row.tplid, desc_input);
										}}
									>
										{$_('button.set')}
									</Button>
									<Button
										on:click={(e) => {
											e.preventDefault();
											addDescForTplid = '';
											desc_input = '';
										}}
									>
										{$_('button.close')}
									</Button>
								</InputGroup>
							</Row>
						</Container>
					</td>
				</tr>
			{/if}
			{#if setTagForTplid === row.tplid}
				<tr>
					<td colspan="4">
						<Container>
							<Row>
								<InputGroup>
									<div class="form-floating flex-fill">
										<input
											name={'newtag-' + index}
											class="form-control"
											id={'input-tplid-' + index}
											placeholder="New tags"
											bind:value={tag_input}
											on:change={async (e) => {
												e.preventDefault();
												console.log(tag_input);
												await addTags(index, row.tplid, row.tags, tag_input);
												tag_input = '';
											}}
										/>
										<label for={`input-tplid-${index}`}
											>input new tags delimitered by space/;/,
										</label>
									</div>
									<Button
										color="primary"
										on:click={async (e) => {
											e.preventDefault();
											await addTags(index, row.tplid, row.tags, tag_input);
											tag_input = '';
										}}
									>
										{$_('button.set')}
									</Button>
									<Button
										on:click={(e) => {
											e.preventDefault();
											setTagForTplid = '';
										}}
									>
										{$_('button.close')}
									</Button>
								</InputGroup>
							</Row>
							{#each row.tags as tag, tagIndex}
								{#if tag.owner === user.email}
									<Badge pill color="light" class="kfk-tag text-primary border border-primary">
										{tag.text}
										<a
											href={'#'}
											on:click|preventDefault={() => {
												deleteATag(index, row.tplid, row.tags, tag.text);
											}}
										>
											<Icon name="x" />
										</a>
									</Badge>
								{/if}
							{/each}
						</Container>
					</td>
				</tr>
			{/if}
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
