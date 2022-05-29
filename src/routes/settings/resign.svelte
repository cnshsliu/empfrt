<script lang="ts">
	import { _ } from '$lib/i18n';
	import * as api from '$lib/api';
	import { mtcConfirm, mtcConfirmReset } from '$lib/Stores';
	import { tick } from 'svelte';
	import suuid from 'short-uuid';
	import {
		Card,
		CardBody,
		CardTitle,
		Container,
		Row,
		Col,
		Button,
		InputGroup,
		InputGroupText,
		Input,
	} from 'sveltestrap';
	import { session } from '$app/stores';
	import { setFadeMessage } from '$lib/Notifier';
	import type { EmpResponse } from '$lib/types';
	import { goto } from '$app/navigation';
	const CHECK_INTERVAL = 1000;
	let user = $session.user;
	let replace = {
		from: '',
		to: '',
	};
	let tranx = suuid.generate();
	let checked = { all: false, todo: false, wf: false, tpl: false };
	let backed = { all: false, todo: false, wf: false, tpl: false };
	let prepared = { todo: false, wf: false, tpl: false };
	let [todoPrepareResult, wfPrepareResult, tplPrepareResult] = Array(3).fill([]);
	let [
		interval_checkTodoPrepareResult,
		interval_checkWfPrepareResult,
		interval_checkTplPrepareResult,
	] = Array(3).fill(CHECK_INTERVAL);

	const prepareReplace = async () => {
		let res = {} as EmpResponse;
		replace = { from: replace.from.trim(), to: replace.to.trim() };
		if (!replace.from || !replace.to) return;

		const checkTodoPrepareResult = async () => {
			res = await api.post(
				'replace/user/prepare',
				{ tranx: tranx, objtype: 'todo', ...replace },
				user.sessionToken,
			);
			if (res.error) {
				if (res.error === 'USER_NOT_FOUND') {
					setFadeMessage($_('setting.resign.required.to'), 'warning');
				}
			} else {
				interval_checkTodoPrepareResult = setInterval(async () => {
					todoPrepareResult = await api.post(
						'replace/user/prepare/result',
						{ tranx: tranx, objtype: 'todo' },
						user.sessionToken,
					);
					if ((<any>todoPrepareResult).error) {
						clearTimeout(interval_checkTodoPrepareResult);
						todoPrepareResult = [];
					}
					if (todoPrepareResult.filter((x) => x.objid === 'DONE').length > 0) {
						clearTimeout(interval_checkTodoPrepareResult);
						todoPrepareResult = todoPrepareResult.filter((x) => x.objid !== 'DONE');
						todoPrepareResult = todoPrepareResult.map((x) => {
							x.checked = false;
							return x;
						});
						//await checkWfPrepareResult();
						await checkTplPrepareResult();
					}
				}, CHECK_INTERVAL);
			}
			prepared.todo = true;
		};

		const checkWfPrepareResult = async () => {
			res = await api.post(
				'replace/user/prepare',
				{ tranx: tranx, objtype: 'wf', ...replace },
				user.sessionToken,
			);
			if (res.error) {
				if (res.error === 'USER_NOT_FOUND') {
					setFadeMessage($_('setting.resign.required.to'), 'warning');
				}
			} else {
				interval_checkWfPrepareResult = setInterval(async () => {
					wfPrepareResult = await api.post(
						'replace/user/prepare/result',
						{ tranx: tranx, objtype: 'wf' },
						user.sessionToken,
					);
					if ((<any>wfPrepareResult).error) {
						clearTimeout(interval_checkTodoPrepareResult);
						wfPrepareResult = [];
					}
					if (wfPrepareResult.filter((x) => x.objid === 'DONE').length > 0) {
						clearTimeout(interval_checkWfPrepareResult);
						wfPrepareResult = wfPrepareResult.filter((x) => x.objid !== 'DONE');
						wfPrepareResult = wfPrepareResult.map((x) => {
							x.checked = false;
							return x;
						});
						await checkTplPrepareResult();
					}
				}, CHECK_INTERVAL);
			}
		};

		const checkTplPrepareResult = async () => {
			res = await api.post(
				'replace/user/prepare',
				{ tranx: tranx, objtype: 'tpl', ...replace },
				user.sessionToken,
			);
			if (res.error) {
				if (res.error === 'USER_NOT_FOUND') {
					setFadeMessage($_('setting.resign.required.to'), 'warning');
				}
			} else {
				interval_checkTplPrepareResult = setInterval(async () => {
					tplPrepareResult = await api.post(
						'replace/user/prepare/result',
						{ tranx: tranx, objtype: 'tpl' },
						user.sessionToken,
					);
					if ((<any>tplPrepareResult).error) {
						clearTimeout(interval_checkTodoPrepareResult);
						tplPrepareResult = [];
					}
					if (tplPrepareResult.filter((x) => x.objid === 'DONE').length > 0) {
						clearTimeout(interval_checkTplPrepareResult);
						tplPrepareResult = tplPrepareResult.filter((x) => x.objid !== 'DONE');
						tplPrepareResult = tplPrepareResult.map((x) => {
							x.checked = false;
							return x;
						});
					}
				}, CHECK_INTERVAL);
			}
			prepared.tpl = true;
		};

		await checkTodoPrepareResult();
	};

	const onCheckRowChange = async (row, objtype) => {
		if (objtype === 'todo') {
			checked.todo =
				todoPrepareResult.filter((x) => x.checked === true).length === todoPrepareResult.length;
			backed.todo = checked.todo;
		} else if (objtype === 'wf') {
			checked.wf =
				wfPrepareResult.filter((x) => x.checked === true).length === wfPrepareResult.length;
			backed.wf = checked.wf;
		} else if (objtype === 'tpl') {
			checked.tpl =
				tplPrepareResult.filter((x) => x.checked === true).length === tplPrepareResult.length;
			backed.tpl = checked.tpl;
		}
		checked.all =
			todoPrepareResult.length + wfPrepareResult.length + tplPrepareResult.length > 0 &&
			(todoPrepareResult.length == 0 || checked.todo) &&
			(wfPrepareResult.length == 0 || checked.wf) &&
			(tplPrepareResult.length == 0 || checked.tpl);
		backed.all = checked.all;
	};

	const onCheckAllChange = async () => {
		if (checked.all !== backed.all) {
			checked.todo = checked.wf = checked.tpl = checked.all;
			backed.all = checked.all;
		} else {
			if (checked.todo !== backed.todo || checked.wf !== backed.wf || checked.tpl !== backed.tpl) {
				backed.all = false;
				checked.all = false;
			}
		}
		if (checked.todo !== backed.todo) {
			todoPrepareResult = todoPrepareResult.map((x) => {
				x.checked = checked.todo;
				return x;
			});
			backed.todo = checked.todo;
		}
		if (checked.wf !== backed.wf) {
			wfPrepareResult = wfPrepareResult.map((x) => {
				x.checked = checked.wf;
				return x;
			});
			backed.wf = checked.wf;
		}
		if (checked.tpl !== backed.tpl) {
			tplPrepareResult = tplPrepareResult.map((x) => {
				x.checked = checked.tpl;
				return x;
			});
			backed.tpl = checked.tpl;
		}

		checked.all =
			todoPrepareResult.length + wfPrepareResult.length + tplPrepareResult.length > 0 &&
			(todoPrepareResult.length == 0 || checked.todo) &&
			(wfPrepareResult.length == 0 || checked.wf) &&
			(tplPrepareResult.length == 0 || checked.tpl);
		backed.all = checked.all;
	};

	const executeReplace = async (e, isResign = false) => {
		e.preventDefault();
		replace = { from: replace.from.trim(), to: replace.to.trim() };
		if (!replace.from || !replace.to) return;

		let payload = {
			tranx: tranx,
			todo: todoPrepareResult.filter((x) => x.checked),
			wf: wfPrepareResult.filter((x) => x.checked),
			tpl: tplPrepareResult.filter((x) => x.checked),
		};
		for (const key in payload) {
			if (['todo', 'wf', 'tpl'].includes(key)) {
				payload[key] = payload[key].map((x) => {
					return x.objid;
				});
			}
		}
		await api.post('replace/user/execute', payload, user.sessionToken);
		if (isResign) {
			await api.post('replace/user/succeed', { ...replace }, user.sessionToken);
		}
		todoPrepareResult = todoPrepareResult.filter((x) => x.checked === false);
		wfPrepareResult = wfPrepareResult.filter((x) => x.checked === false);
		tplPrepareResult = tplPrepareResult.filter((x) => x.checked === false);
	};

	const executeResign = async (e) => {
		$mtcConfirm = {
			title: $_('setting.resign.confirm.title'),
			body: $_('setting.resign.confirm.body', { values: { from: replace.from } }),
			buttons: [$_('setting.resign.confirm.doit')],
			callbacks: [
				async () => {
					executeReplace(e, true);
					mtcConfirmReset();
				},
			],
		};
	};
</script>

<Container class="mt-3">
	<nav aria-label="breadcrumb">
		<ol class="breadcrumb">
			<li class="breadcrumb-item kfk-tag">
				<a
					class="kfk-link"
					href={'#'}
					on:click={() => {
						goto('/settings');
					}}>
					{$_('navmenu.settings')}
				</a>
			</li>
			<li class="breadcrumb-item active kfk-tag" aria-current="page">
				<a
					class="kfk-link"
					href={'#'}
					on:click={() => {
						goto('/settings/tenant');
					}}>
					{$_('setting.tenant.nav')}
				</a>
			</li>
			<li class="breadcrumb-item active kfk-tag" aria-current="page">
				<a
					class="kfk-link"
					href={'#'}
					on:click={() => {
						goto('/settings/orgchart');
					}}>
					{$_('setting.orgchart.nav')}
				</a>
			</li>
			<li class="breadcrumb-item active kfk-tag" aria-current="page">
				<a
					class="kfk-link"
					href={'#'}
					on:click={() => {
						goto('/settings/members');
					}}>
					{$_('setting.members.nav')}
				</a>
			</li>
			<li class="breadcrumb-item active" aria-current="page">
				{$_('setting.resign.nav')}
			</li>
		</ol>
	</nav>
	{#if user.group === 'ADMIN'}
		<Card>
			<CardBody>
				<form>
					<CardTitle>{$_('setting.resign.replaceuser')}</CardTitle>
					<Row>
						{#if todoPrepareResult.length + wfPrepareResult.length + tplPrepareResult.length > 0}
							<Col class="col-auto">
								<input
									class="form-check-input"
									type="checkbox"
									bind:checked={checked.all}
									on:change={onCheckAllChange} />
							</Col><Col class="fw-bold">
								{$_('setting.resign.selectall')}
							</Col>
						{/if}
						<Col class="col-auto mb-1">
							<button class="btn btn-primary" on:click|preventDefault={executeReplace}>
								{$_('setting.resign.replace')}
							</button>
							<button class="btn btn-warning" on:click|preventDefault={executeResign}>
								{$_('setting.resign.execute')}
							</button>
						</Col>
					</Row>
					<Row>
						<InputGroup>
							<InputGroupText>{$_('setting.resign.from')}</InputGroupText>
							<Input
								bind:value={replace.from}
								placeholder={$_('setting.resign.placeholder.from')} />
							<InputGroupText>{$_('setting.resign.to')}</InputGroupText>
							<Input bind:value={replace.to} placeholder={$_('setting.resign.placeholder.to')} />
							<Button
								on:click={(e) => {
									e.preventDefault();
									prepareReplace();
								}}>
								{$_('setting.resign.prepare')}
							</Button>
						</InputGroup>
					</Row>
					<Row class="mt-3">
						<Col class="col-auto">
							{#if todoPrepareResult.length > 0}
								<input
									class="form-check-input"
									type="checkbox"
									bind:checked={checked.todo}
									on:change={onCheckAllChange} />
							{:else}
								<i class={prepared.todo ? 'bi bi-check-circle' : 'bi bi-question-circle'} />
							{/if}
						</Col>
						<Col class="fw-bold">{$_('setting.resign.result.todo')}</Col>
					</Row>
					{#each todoPrepareResult as row}
						<Row cols="3">
							<Col class="col-auto">
								<input
									class="form-check-input"
									type="checkbox"
									bind:checked={row.checked}
									on:change={(e) => {
										e.preventDefault();
										onCheckRowChange(row, 'todo');
									}} />
							</Col>
							<Col>{row.objtitle}</Col>
							<Col>{row.objid}</Col>
						</Row>
					{/each}
					<!--
					<Row class="mt-3">
						{#if wfPrepareResult.length > 0}
							<Col class="col-auto">
								<input
									class="form-check-input"
									type="checkbox"
									bind:checked={checked.wf}
									on:change={onCheckAllChange} />
							</Col>
						{/if}
						<Col class="fw-bold">{$_('setting.resign.result.wf')}</Col>
					</Row>
					{#each wfPrepareResult as row}
						<Row cols="3">
							<Col class="col-auto">
								<input
									class="form-check-input"
									type="checkbox"
									bind:checked={row.checked}
									on:change={(e) => {
										e.preventDefault();
										onCheckRowChange(row, 'wf');
									}} />
							</Col>
							<Col>{row.objtitle}</Col>
							<Col>{row.objid}</Col>
						</Row>
            {/each} -->
					<Row class="mt-3">
						<Col class="col-auto">
							{#if tplPrepareResult.length > 0}
								<input
									class="form-check-input"
									type="checkbox"
									bind:checked={checked.tpl}
									on:change={onCheckAllChange} />
							{:else}
								<i class={prepared.tpl ? 'bi bi-check-circle' : 'bi bi-question-circle'} />
							{/if}
						</Col>
						<Col class="fw-bold">{$_('setting.resign.result.tpl')}</Col>
					</Row>
					{#each tplPrepareResult as tpl, tplIndex}
						<Row cols="2">
							<Col class="col-auto">
								<input
									class="form-check-input"
									type="checkbox"
									id={`tpl_${tplIndex}`}
									bind:checked={tpl.checked}
									on:change={(e) => {
										e.preventDefault();
										onCheckRowChange(tpl, 'tpl');
									}} />
							</Col>
							<Col class="kfk-tag">
								<!--a href="/template/{tpl.objid}&read" target="_new">{tpl.objid}</a -->
								{tpl.objid}
							</Col>
						</Row>
					{/each}
				</form>
			</CardBody>
		</Card>
	{:else}
		<Row>Only Administrator has access to operations in this section</Row>
	{/if}
</Container>
