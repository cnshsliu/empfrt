<script type="ts">
	import { _, date, time } from '$lib/i18n';
	import * as Utils from '$lib/utils';
	import * as api from '$lib/api';
	import TagPicker from '$lib/TagPicker.svelte';
	import TimeTool from '$lib/TimeTool';
	import { slide, fade } from 'svelte/transition';
	import { setFadeMessage } from '$lib/Notifier';
	import Searchlet from '$lib/Searchlet.svelte';
	import Transition from '$lib/Transition.svelte';
	import AniIcon from '$lib/AniIcon.svelte';
	import { navigating, session } from '$app/stores';
	import { autorefreshid, filterStorage } from '$lib/empstores';
	import ColPerRowSelection from '$lib/ColPerRowSelection.svelte';
	import {
		showAdvancedSearch,
		srPage,
		lastQuery,
		worklistChangeFlag,
		mtcConfirm,
		mtcConfirmReset,
		forcePreDelete,
		delayLoadOnMount,
		workRefreshInterval,
	} from '$lib/Stores';
	import PageSize from '$lib/PageSize.svelte';
	import { tspans } from '$lib/variables';
	import { onMount, onDestroy } from 'svelte';
	import Parser from '$lib/parser';
	import type { Work } from '$lib/types';
	import Pagination from '$lib/pagination/Pagination.svelte';
	import Search from '$lib/pagination/Search.svelte';
	import Sort from '$lib/pagination/Sort.svelte';
	import { goto } from '$app/navigation';
	import { post } from '$lib/utils';
	import { title } from '$lib/title';

	$title = 'HyperFlow';
	import {
		Container,
		Row,
		Col,
		Button,
		InputGroup,
		InputGroupText,
		Input,
		Icon,
	} from 'sveltestrap';
	import { createEventDispatcher, getContext, setContext } from 'svelte';

	const ENDPOINT = 'work/search';
	const BIZ = 'todo';
	const AUTO_RELOAD_IN_MINUTES = 1;
	const AUTO_RELOAD_EVERY_SECONDS = 15;
	let myAutoRefreshId = new Date().getTime().toString();
	let autoReloadStartAt = 0;
	let loadTimer = null;
	let bypassCache = false;
	let LOADING_TIMEOUT = 400;
	if (!$filterStorage[BIZ]) {
		$filterStorage[BIZ] = { tplTag: '', sortby: '-createdAt' };
	}
	if ($filterStorage[BIZ].hasOwnProperty('sortby') === false) {
		$filterStorage[BIZ].sortby = '-createdAt';
	}

	if ($session.user.tenant === undefined) {
		setTimeout(async () => {
			$mtcConfirm = {
				title: $_('confirm.title.needReload') + 'Tenant id',
				body: $_('confirm.body.needReload'),
				buttons: [$_('confirm.button.confirm')],
				callbacks: [
					async () => {
						window.location.reload();
						mtcConfirmReset();
					},
				],
			};
		}, 5000);
	}
	let rows = [];
	let pageIndex = 0; //first row
	if (!$filterStorage[BIZ]) $filterStorage[BIZ] = {};

	let loading = true;
	let loadingFromServer = false;
	let clearLoadingFromServerTimer = null;
	let rowsCount = 0;
	let show_calendar_select = false;
	let user = $session.user;
	let autoRefreshTimes = 0;
	let bizSearchCondition = { init: true, search: '', extra: {} };
	let aSsPicked = '';
	let statuses = [
		{ value: 'All', label: $_('status.All') },
		{ value: 'ST_RUN', label: $_('status.ST_RUN') },
		{ value: 'ST_PAUSE', label: $_('status.ST_PAUSE') },
		{ value: 'ST_DONE', label: $_('status.ST_DONE') },
	];

	if (!$session.tplIdsForSearch_for_todo) {
		$session.tplIdsForSearch_for_todo = [];
	}
	if ($filterStorage[BIZ].calendar_begin !== '' || $filterStorage[BIZ].calendar_end !== '') {
		show_calendar_select = true;
	} else {
		show_calendar_select = false;
	}

	$: filteredRows = rows;
	setContext('state', {
		getState: () => ({
			page: $srPage[BIZ],
			pageSize: $filterStorage.pageSize,
			rows,
			filteredRows,
		}),
		setPage: (_page) => {
			$srPage[BIZ] = _page;
		},
		setRows: (_rows) => {
			filteredRows = _rows;
		},
	});

	const clearTag = async function (preDelete = false) {
		$filterStorage[BIZ].tplTag = '';
		try {
			let tmp = await api.post(
				'template/tplid/list',
				{},
				user.sessionToken,
				preDelete ? api.CACHE_FLAG.preDelete : api.CACHE_FLAG.useIfExists,
			);
			$session.tplIdsForSearch_for_todo = tmp.map((x) => x.tplid);
			await searchNow();
		} catch (err) {
			console.error(err);
		}
	};

	const useThisTag = async function (tag, appendMode = false) {
		if (appendMode) {
			let existingTags = $filterStorage[BIZ].tplTag;
			if (Parser.isEmpty(existingTags)) {
				existingTags = '';
			}
			let existingArr = existingTags.split(';');
			if (existingArr.includes(tag)) {
				existingArr = existingArr.filter((x) => x !== tag);
			} else {
				existingArr.push(tag);
				existingArr = existingArr.filter((x) => x.length > 0);
			}
		} else {
			if (tag.trim().length > 0) $filterStorage[BIZ].tplTag = tag.trim();
			else $filterStorage[BIZ].tplTag = '';
		}
		$filterStorage[BIZ].tplid = '';
		let tmp = await api.post(
			'template/tplid/list',
			{ tags: $filterStorage[BIZ].tplTag },
			user.sessionToken,
		);
		$session.tplIdsForSearch_for_todo = tmp.map((x) => x.tplid);
		await searchNow();
	};

	async function load(_page, reason = 'refresh', cacheFlag = api.CACHE_FLAG.bypass) {
		loading = true;
		let payload = {
			pattern: $filterStorage[BIZ].pattern,
			skip: _page * $filterStorage.pageSize,
			limit: $filterStorage.pageSize,
			sortby: $filterStorage[BIZ].sortby,
			status: $filterStorage[BIZ].status,
			tspan: $filterStorage[BIZ].tspan,
			doer: $filterStorage[BIZ].doer,
			reason: reason,
		};
		if ($filterStorage[BIZ].tplTag) {
			payload['tagsForFilter'] = $filterStorage[BIZ].tplTag.split(';');
		}
		if ($filterStorage[BIZ].tplid && $filterStorage[BIZ].tplid.trim().length > 0) {
			payload['tplid'] = $filterStorage[BIZ].tplid.trim();
		}
		if ($filterStorage[BIZ].calendar_begin && $filterStorage[BIZ].calendar_end) {
			payload['calendar_begin'] = $filterStorage[BIZ].calendar_begin;
			payload['calendar_end'] = $filterStorage[BIZ].calendar_end;
		}

		let { skip: _skip, ...payloadWithoutSkip } = payload;
		if (false === Utils.objectEqual(payloadWithoutSkip, $lastQuery[BIZ])) {
			payload.skip = 0;
			$srPage[BIZ] = 0;
		}
		$lastQuery[BIZ] = payloadWithoutSkip;

		payload['showpostponed'] = $session.showpostponed;
		const loadPost = async () => {
			loadingFromServer = true;
			const ret = await api.post(
				ENDPOINT,
				payload,
				user.sessionToken,
				bypassCache ? api.CACHE_FLAG.bypass : cacheFlag,
			);
			if (bypassCache === true) {
				bypassCache = false;
			}
			if (clearLoadingFromServerTimer) {
				clearTimeout(clearLoadingFromServerTimer);
			}
			clearLoadingFromServerTimer = setTimeout(() => {
				loadingFromServer = false;
				clearLoadingFromServerTimer = null;
			}, 2000);
			if (ret.error) {
				if (ret.error === 'KICKOUT') {
					setFadeMessage($_('session.forcetohome'), 'warning');
					goto('/');
				} else {
					setFadeMessage(ret.message, 'warning');
				}
			} else {
				rows = ret.objs;
				rowsCount = ret.total;
				for (let i = 0; i < rows.length; i++) {
					//设置postpone下拉列表的缺省选择项
					rows[i]['postponeday'] = 1;
					//计算已存在的postpone的显示值
					if (rows[i].postpone > 0) {
						rows[i].fromNow = TimeTool.fromNow(
							TimeTool.dayjs(rows[i].postPonedAt).add(rows[i].postpone, 'day'),
						);
					}
				}
			}
		};
		loadTimer && clearTimeout(loadTimer);
		if (
			bypassCache === false &&
			cacheFlag === api.CACHE_FLAG.useIfExists &&
			api.hasCache(ENDPOINT, payload, user.sessionToken)
		)
			//Direct return cache without wait.
			await loadPost();
		else {
			//Wait certain ms to fetch from server
			loadTimer = setTimeout(async () => {
				await loadPost();
				loadTimer = null;
			}, LOADING_TIMEOUT);
		}
		loading = false;
	}

	function onPageChange(event) {
		load(event.detail.page, 'refresh', api.CACHE_FLAG.useIfExists);
		$srPage[BIZ] = event.detail.page;
	}

	const calendar_changed = function () {
		if (
			Parser.hasValue($filterStorage[BIZ].calendar_begin) &&
			Parser.isEmpty($filterStorage[BIZ].calendar_end)
		) {
			$filterStorage[BIZ].calendar_end = $filterStorage[BIZ].calendar_begin;
		}
		if (
			Parser.hasValue($filterStorage[BIZ].calendar_begin) &&
			Parser.hasValue($filterStorage[BIZ].calendar_end)
		) {
			searchNow().then();
		}
	};

	async function searchNow(preDelete = false) {
		if (Utils.isBlank($filterStorage[BIZ].tplTag)) {
			$filterStorage[BIZ].tplTag = '';
		}
		if (Utils.isBlank($filterStorage[BIZ].doer)) {
			$filterStorage[BIZ].doer = user.email;
		}
		if (Utils.isBlank($filterStorage[BIZ].status)) {
			$filterStorage[BIZ].status = 'ST_RUN';
		}
		if (Utils.isBlank($filterStorage[BIZ].pattern)) {
			$filterStorage[BIZ].pattern = '';
		}
		if (Utils.isBlank($filterStorage[BIZ].calendar_begin)) $filterStorage[BIZ].calendar_begin = '';
		if (Utils.isBlank($filterStorage[BIZ].calendar_end)) $filterStorage[BIZ].calendar_end = '';
		load(
			$srPage[BIZ],
			'refresh',
			preDelete ? api.CACHE_FLAG.preDelete : api.CACHE_FLAG.useIfExists,
		).then((res) => {});
	}

	function resetQuery(preDelete = false) {
		$filterStorage[BIZ].tplTag = '';
		$filterStorage[BIZ].status = 'ST_RUN';
		$filterStorage[BIZ].tplid = '';
		$filterStorage[BIZ].doer = user.email;
		$filterStorage[BIZ].pattern = '';
		$filterStorage[BIZ].tspan = 'any';
		$filterStorage[BIZ].calendar_begin = '';
		$filterStorage[BIZ].calendar_end = '';
		show_calendar_select = false;
		aSsPicked = '';
		$srPage[BIZ] = 0;
		if (preDelete) {
			api.removeCacheByPath('work/search');
		}
		searchNow(preDelete).then();
		if (preDelete) {
			immediateReload();
		}
	}

	function restartAutoRefresh() {
		$autorefreshid = myAutoRefreshId;
		autoReloadStartAt = new Date().getTime();
		console.log('New Interval');
		$workRefreshInterval = setInterval(() => {
			if ($autorefreshid === myAutoRefreshId) {
				immediateReload();
				if (new Date().getTime() - autoReloadStartAt > AUTO_RELOAD_IN_MINUTES * 60 * 1000) {
					$autorefreshid = '0';
				}
			} else {
				$workRefreshInterval && clearInterval($workRefreshInterval as number);
			}
		}, AUTO_RELOAD_EVERY_SECONDS * 1000);
	}

	const toggleAdvancedSearch = async () => {
		$showAdvancedSearch[BIZ] = !$showAdvancedSearch[BIZ];
		if ($showAdvancedSearch[BIZ] == false) {
			resetQuery();
		} else {
			if (!$session.tplIdsForSearch_for_todo || $session.tplIdsForSearch_for_todo.length === 0) {
				let tmp = await api.post(
					'template/tplid/list',
					{ tags: $filterStorage[BIZ].tplTag },
					user.sessionToken,
				);
				$session.tplIdsForSearch_for_todo = tmp.map((x) => x.tplid);
			}

			if (!$session.delegators) {
				let delegations = await api.post('/delegation/to/me/today', {}, $session.user.sessionToken);
				$session.delegators = delegations.map((x: any) => x.delegator);
				if ($session.delegators.includes($session.user.email) === false) {
					$session.delegators.push($session.user.email);
				}
			}
		}
	};

	async function onSort(event) {
		$filterStorage[BIZ].sortby =
			(event.detail.dir === 'desc' ? '-' : '') +
			(event.detail.key === 'name' ? 'title' : event.detail.key);
		await load($srPage[BIZ], 'refresh', api.CACHE_FLAG.useIfExists);
	}

	function gotoWorkitem(work: Work, anchor = '') {
		goto(`/work/${work.todoid}${anchor}`, {
			replaceState: false,
		});
	}

	function gotoWorkflow(wfid: string) {
		goto(`/workflow/${wfid}`, { replaceState: false });
	}
	let isMobile = false;

	const immediateReload = () => {
		bypassCache = true;
		searchNow();
		if ($worklistChangeFlag) {
			$worklistChangeFlag = 0;
		}
	};

	//在流程变化，通过goto回到本页时，设置 delayLoadOnMount，等待服务端完成工作，可获得最新的列表
	//delayLoadOnMount缺省为0，
	$: $worklistChangeFlag && $delayLoadOnMount === 0 && immediateReload();

	const relogin = async () => {
		await post(`/auth/logout`);
		try {
			$session = { user: null };
		} catch (e) {}
		goto('/login');
		setFadeMessage($_('session.relogin'), 'warning');
	};

	const postpone = async (todoid: string, days: number) => {
		$mtcConfirm = {
			title: $_('confirm.title.postpone'),
			body: $_('confirm.body.postpone', { values: { days: days } }),
			buttons: [$_('confirm.button.confirm')],
			callbacks: [
				async () => {
					api.post('/work/postpone', { todoid, days }, user.sessionToken);
					resetQuery(true);
				},
			],
		};
	};

	onMount(async () => {
		isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		//根据产品的更新情况，这里是新的代码要求有tenant._id
		const tenantid = $session.user.tenant._id;
		if (!tenantid) {
			await relogin();
		}
		if ($workRefreshInterval) {
			console.log('Clear existing interval');
			clearInterval($workRefreshInterval as number);
		}
		setTimeout(
			async () => {
				if ($showAdvancedSearch[BIZ] === undefined) {
					//console.log('First time loading...');
					LOADING_TIMEOUT = 0;
					$showAdvancedSearch[BIZ] = false;
					resetQuery($forcePreDelete);
					$forcePreDelete = false;
				} else {
					LOADING_TIMEOUT = 400;
					//console.log('Not first time loading...');
					if ($showAdvancedSearch[BIZ] === false) {
						//console.log('showAdvancedSearch === false...');
						resetQuery($forcePreDelete);
						$forcePreDelete = false;
					} else {
						//console.log('showAdvancedSearch === true...');
						await searchNow($forcePreDelete);
						$forcePreDelete = false;
					}
				}
				if ($delayLoadOnMount !== 0) $delayLoadOnMount = 0;
				restartAutoRefresh();
			},
			$delayLoadOnMount ? $delayLoadOnMount : 0,
		);
		import('bootstrap').then((bootstrap) => {
			const popoverTriggerList = [].slice.call(
				document.querySelectorAll('[data-bs-toggle="popover"]'),
			);
			const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
				return new bootstrap.Popover(popoverTriggerEl);
			});
		});
	});

	onDestroy(async () => {
		bypassCache = false;
		$autorefreshid = '0';
		clearInterval($workRefreshInterval as number);
	});

	let showform = '';
	let flexible = { name: '' };
	const startFlexible = async () => {
		const popoverList = [].slice.call(document.querySelectorAll('.popover'));
		popoverList.map((popoverEl: any) => {
			popoverEl.remove();
		});
		let res = await api.post('flexible/start', flexible, user.sessionToken);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
		} else {
			setFadeMessage($_('notify.success_create_flexible'));
		}
		showform = '';
	};
</script>

<Container class="p-2 border border-1 rounded">
	<div class="d-flex">
		<div class="flex-shrink-0 fs-3">
			{$_('title.worklist')}
		</div>
		<div class="ms-5 align-self-start flex-grow-1">
			<div
				class="btn btn-primary"
				data-bs-trigger="hover"
				data-bs-toggle="popover"
				data-bs-placement="top"
				data-bs-title={$_('tips.newwork.title')}
				data-bs-content={$_('tips.newwork.content')}
				on:click|preventDefault={(e) => {
					goto('/template');
				}}>
				{$_('flexible.btn_goto_template')}
			</div>
			<div
				class="btn btn-primary"
				data-bs-trigger="hover"
				data-bs-toggle="popover"
				data-bs-placement="top"
				data-bs-title={$_('tips.flexible.title')}
				data-bs-content={$_('tips.flexible.content')}
				on:click|preventDefault={(e) => {
					showform = showform === 'flexible' ? '' : 'flexible';
				}}>
				{$_('flexible.btn_showform')}
			</div>
		</div>
		<div class="justify-content-end">
			<div class="btn border-0 me-3">
				<div
					style="display:inline-flex; width:28px; height:28px; justify-content:center; align-items: center;"
					on:click={(e) => {
						if ($autorefreshid === myAutoRefreshId) {
							setFadeMessage($_('notify.stop_refresh_work'));
							$autorefreshid = '0';
						} else {
							restartAutoRefresh();
							setFadeMessage(
								$_('notify.auto_refresh_work', { values: { minutes: AUTO_RELOAD_IN_MINUTES } }),
							);
						}
					}}>
					{#if $autorefreshid === myAutoRefreshId}
						<div
							class={'text-center refreshIndicator active' +
								(loadingFromServer ? '  loading' : '')}>
							&nbsp;
						</div>
					{:else}
						<div class={'refreshIndicator stale'}>&nbsp;</div>
					{/if}
				</div>
			</div>
			<div
				class="btn btn-primary m-0 p-1"
				color="primary"
				on:click|preventDefault={toggleAdvancedSearch}>
				{#if $showAdvancedSearch[BIZ]}
					<i class="bi bi-x-circle" />
				{:else}
					<i class="bi bi-search" />
				{/if}
				{$_('button.toggleAdvancedSearch')}
			</div>
			<div
				class="btn btn-primary m-0 p-1 btn-lg"
				color="primary"
				on:click|preventDefault={(e) => {
					resetQuery(true);
				}}>
				{$_('button.resetQuery')}
			</div>
		</div>
	</div>
	{#if showform === 'flexible'}
		<div class="row">
			<input
				class="form-control"
				bind:value={flexible.name}
				placeholder={$_('flexible.placeholder')} />
			<div
				class="btn btn-primary"
				on:click|preventDefault={(e) => {
					startFlexible();
				}}>
				{$_('flexible.btn_create')}
			</div>
		</div>
	{/if}
	<TagPicker {BIZ} {useThisTag} {clearTag} />
	{#if $showAdvancedSearch[BIZ]}
		<Row class="mb-3 d-flex justify-content-end">
			{#each statuses as status, index (status)}
				<Col xs="auto">
					<label>
						<input
							type="radio"
							bind:group={$filterStorage[BIZ].status}
							value={status.value}
							on:change|preventDefault={(e) => {
								searchNow();
							}} />
						{status.label}
					</label>
				</Col>
			{/each}
		</Row>
		<Row cols={{ xs: 1, md: 2 }}>
			<Col>
				<InputGroup>
					<InputGroupText>{$_('extrafilter.template')}</InputGroupText>
					<select
						class="form-select"
						name="selectTpl"
						id="tplSelect"
						bind:value={$filterStorage[BIZ].tplid}
						on:change|preventDefault={async (e) => {
							e.preventDefault();
							await searchNow();
						}}>
						<option value="">
							{$_('extrafilter.allTemplate')}
						</option>
						{#if $session.tplIdsForSearch_for_todo}
							{#each $session.tplIdsForSearch_for_todo as tpl, index (tpl)}
								<option value={tpl} selected={tpl === $filterStorage[BIZ].tplid}>
									{tpl}
								</option>
							{/each}
						{/if}
					</select>
				</InputGroup>
			</Col>
			{#if user.group === 'ADMIN'}
				<Col>
					<InputGroup class="kfk-input-template-name d-flex">
						<InputGroupText>{$_('extrafilter.starter')}</InputGroupText>
						<Input
							class="flex-fill"
							name="other_doer"
							bind:value={$filterStorage[BIZ].doer}
							aria-label="User Email"
							placeholder="email" />
						<Button
							on:click={(e) => {
								e.preventDefault();
								searchNow();
							}}
							color="primary">
							<i class="bi bi-arrow-return-left" />
						</Button>
						<Button
							class="btn-secondary"
							on:click={() => {
								$filterStorage[BIZ].doer = user.email;
								searchNow();
							}}>
							{$_('extrafilter.me')}
						</Button>
						<Button
							on:click={async () => {
								$filterStorage[BIZ].doer = '';
								await searchNow();
							}}
							class="btn-secondary m-0 py-1 px-3">
							{$_('remotetable.any')}
						</Button>
					</InputGroup>
				</Col>
			{/if}
		</Row>

		<Row cols={{ xs: 1, md: 2 }} class="mt-1">
			<Col>
				<div class="search d-flex">
					<InputGroup>
						<InputGroupText>
							{$_('remotetable.filter')}
						</InputGroupText>
						<input
							class="flex-fill form-control"
							type="search"
							title={$_('remotetable.bywhat')}
							placeholder={$_('remotetable.bywhat')}
							bind:value={$filterStorage[BIZ].pattern} />
						<div
							class="btn btn-primary"
							on:click|preventDefault={(e) => {
								searchNow();
							}}>
							<i class="bi bi-arrow-return-left" />
						</div>
					</InputGroup>
				</div>
			</Col>
			<Col>
				<InputGroup>
					<InputGroupText>
						{$_('remotetable.in')}
					</InputGroupText>
					<select
						class="form-control"
						type="select"
						id="timespanSelect"
						bind:value={$filterStorage[BIZ].tspan}
						on:change={async (e) => {
							e.preventDefault();
							await load($srPage[BIZ], 'refresh', api.CACHE_FLAG.useIfExists);
						}}>
						{#each Object.keys(tspans) as key}
							<option value={key}>{tspans[key]}</option>
						{/each}
					</select>
					<Button
						on:click={async () => {
							if (show_calendar_select) {
								$filterStorage[BIZ].calendar_begin = '';
								$filterStorage[BIZ].calendar_end = '';
								show_calendar_select = false;
								await searchNow(null);
							} else {
								show_calendar_select = true;
							}
						}}>
						{$_('remotetable.start_end')}
					</Button>
				</InputGroup>
			</Col>
		</Row>
		{#if show_calendar_select}
			<Row cols={{ xs: 1, md: 2 }} class="mt-1">
				<Col>
					<InputGroup>
						<InputGroupText>Begin:</InputGroupText>
						<Input
							type="date"
							bind:value={$filterStorage[BIZ].calendar_begin}
							on:change={calendar_changed} />
					</InputGroup>
				</Col>
				<Col>
					<InputGroup>
						<InputGroupText>End:</InputGroupText>
						<Input
							type="date"
							bind:value={$filterStorage[BIZ].calendar_end}
							on:change={calendar_changed} />
						<Button on:click={calendar_changed} color="primary">
							<i class="bi bi-arrow-return-left" />
						</Button>
					</InputGroup>
				</Col>
			</Row>
		{/if}
		<Row class="mt-1">
			<Col>
				<Searchlet
					objtype="todo"
					bind:aSsPicked
					on:searchlet={(msg) => {
						let ss = JSON.parse(msg.detail.ss);
						ss.pattern && ($filterStorage[BIZ].pattern = ss.pattern);
						ss.status && ($filterStorage[BIZ].status = ss.status);
						ss.tspan && ($filterStorage[BIZ].tspan = ss.tspan);
						if (ss.doer) $filterStorage[BIZ].doer = ss.doer;
						else $filterStorage[BIZ].doer = user.email;
						if (ss.tplid) $filterStorage[BIZ].tplid = ss.tplid;
						else $filterStorage[BIZ].tplid = '';
						ss.calendar_begin && ($filterStorage[BIZ].calendar_begin = ss.calendar_begin);
						ss.calendar_end && ($filterStorage[BIZ].calendar_end = ss.calendar_end);

						if (
							$filterStorage[BIZ].calendar_begin !== '' ||
							$filterStorage[BIZ].calendar_end !== ''
						) {
							show_calendar_select = true;
						} else {
							show_calendar_select = false;
						}

						searchNow().then();
					}}
					on:resetSearchlet={(msg) => {
						aSsPicked = '';
						resetQuery(true);
					}} />
			</Col>
		</Row>
	{/if}

	{#key rowsCount}
		<div class="mt-3 ">
			<Pagination
				page={$srPage[BIZ]}
				pageSize={$filterStorage.pageSize}
				count={rowsCount}
				{isMobile}
				on:pageChange={onPageChange} />
		</div>
	{/key}
	<div class="d-flex mt-2 p-0 w-100">
		<div class="w-100">
			<Row>
				<Col>{$_('remotetable.sortBy')}:</Col>
				<Col>
					{$_('remotetable.title')}
					<Sort
						key="title"
						on:sort={onSort}
						dir={$filterStorage[BIZ].sortby.indexOf('title') < 0
							? 'asc'
							: $filterStorage[BIZ].sortby[0] === '-'
							? 'desc'
							: 'asc'} />
				</Col>
				<Col>
					{$_('remotetable.status')}
					<Sort
						key="status"
						on:sort={onSort}
						dir={$filterStorage[BIZ].sortby.indexOf('status') < 0
							? 'asc'
							: $filterStorage[BIZ].sortby[0] === '-'
							? 'desc'
							: 'asc'} />
				</Col>
				<Col>
					{$_('remotetable.createdAt')}
					<Sort
						key="createdAt"
						on:sort={onSort}
						dir={$filterStorage[BIZ].sortby.indexOf('createdAt') < 0
							? 'asc'
							: $filterStorage[BIZ].sortby[0] === '-'
							? 'desc'
							: 'asc'} />
				</Col>
				<Col>
					{$_('remotetable.lasting')}
					<Sort
						key="lastdays"
						on:sort={onSort}
						dir={$filterStorage[BIZ].sortby.indexOf('lastdays') < 0
							? 'asc'
							: $filterStorage[BIZ].sortby[0] === '-'
							? 'desc'
							: 'asc'} />
				</Col>
			</Row>
		</div>
		<div class="flex-shrink-1">
			<PageSize
				on:pagesize={async (e) => {
					await load(0, 'refresh', api.CACHE_FLAG.useIfExists);
				}} />
		</div>
		<div class="flex-shrink-1">
			<ColPerRowSelection />
		</div>
	</div>
	<Row cols={$filterStorage.col_per_row}>
		{#each rows as row, index (row)}
			<Col class="mb-2 card p-2">
				<div class="row">
					<div class="col">
						<h5 class="">
							<a
								class="preview-link   kfk-work-id tnt-work-id"
								href={'#'}
								on:click|preventDefault={(e) => {
									e.preventDefault();
									gotoWorkitem(row);
								}}>
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
						</h5>
					</div>
					<div class="col-auto text-nowrap ">
						{$_('remotetable.lasting')}:
						{row.lastdays}
					</div>
					<div class="col-auto text-nowrap ">
						<a
							href={'#'}
							class="btn btn-primary btn-sm"
							data-bs-trigger="hover"
							data-bs-toggle="popover"
							data-bs-placement="top"
							data-bs-title={$_('popover.postpone.title')}
							data-bs-content={$_('popover.postpone.content')}
							on:click={async (e) => {
								e.preventDefault();
								await postpone(row.todoid, row.postponeday);
							}}>
							{$_('remotetable.postpone.text')}
						</a>
						<select bind:value={row.postponeday}>
							{#each [1, 2, 3, 4, 5, 6, 7] as day}
								<option value={day}>
									{$_('remotetable.postpone.' + (day === 1 ? 'single' : 'plural'), {
										values: { days: day },
									})}
								</option>
							{/each}
						</select>
					</div>
				</div>
				{#if row.postpone > 0}
					<div class="row">
						<div class="col">&nbsp;</div>
						<div class="col-auto">
							{$_('remotetable.postpone.in')}{row.fromNow}
							<a
								href={'#'}
								class="btn btn-sm m-0 p-0"
								on:click|preventDefault={(e) => {
									postpone(row.todoid, 0);
								}}>
								{$_('button.cancel')}
							</a>
						</div>
					</div>
				{/if}
				<div class="row">
					<div class="col-auto">
						{$_('remotetable.status')}:
						{$_('status.' + row.status)}
					</div>
					<div class="col">
						{$_('remotetable.updatedAt')}:
						{#if row.doneat}
							{$date(new Date(row.doneat))}
							{$time(new Date(row.doneat))}
						{:else}
							{$date(new Date(row.createdAt))}
							{$time(new Date(row.createdAt))}
						{/if}
					</div>
				</div>
				<Row class="fs-6">
					<Col class="kfk-tag">
						{$_('remotetable.belongTo')}:
						<a
							class="kfk-link fs-6"
							href={'#'}
							on:click={(e) => {
								e.preventDefault();
								gotoWorkflow(row.wfid);
							}}>
							{row.wftitle}
						</a>
						{#if row.allowdiscuss}
							<a
								href={'#'}
								class="ms-3 fs-6 kfk-workflow-id tnt-workflow-id kfk-link"
								on:click={() => gotoWorkitem(row, '#discussion_area')}>
								<AniIcon icon="chat-dots-fill" ani="aniShake" />
								{row.commentCount > 0 ? row.commentCount : ''}
							</a>
						{/if}
					</Col>
				</Row>
			</Col>
		{/each}
	</Row>
	<Row>
		<div class="col">&nbsp;</div>
		<div class="col-auto">
			<input
				type="checkbox"
				bind:checked={$session.showpostponed}
				on:change={(e) => {
					resetQuery(true);
				}} />
			显示延后工作项
		</div>
	</Row>

	{#key rowsCount}
		<div class="mt-3 ">
			<Pagination
				page={$srPage[BIZ]}
				pageSize={$filterStorage.pageSize}
				count={rowsCount}
				{isMobile}
				on:pageChange={onPageChange} />
		</div>
	{/key}
</Container>
