<script lang="ts">
	import { _ } from '$lib/i18n';
	import Parser from '$lib/parser';
	import { filterStorage } from '$lib/empstores';
	import { ClientPermControl } from '$lib/clientperm';
	import * as api from '$lib/api';
	import CronBuilder from '$lib/CronBuilder.svelte';
	import { session } from '$app/stores';
	import TableDesigner from '$lib/TableDesigner.svelte';
	import { qtb } from '$lib/utils';
	import PDSResolver from '$lib/input/PDSResolver.svelte';
	import ChangeID from './ChangeID.svelte';
	import {
		NavLink,
		Icon,
		Container,
		Button,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Input,
		TabPane,
		TabContent,
	} from 'sveltestrap';
	import type { KVarDefInput, Workflow, Template } from '$lib/types';
	import { createEventDispatcher, setContext, getContext } from 'svelte';
	import { onMount } from 'svelte';
	import RolePicker from '$lib/designer/prop/RolePicker.svelte';

	export let nodeInfo;
	export let kvarsArr: KVarDefInput[];
	export let roleOptions = [];
	export let showHelp;
	export let readonly;
	export let scenario;
	export let workid;
	export let jq;
	export let KFK;
	let todos = [];
	let errmsg = '';

	let oldId = nodeInfo.nodeProps.ACTION.id;
	let TimeTool = null;
	let helpShowing = false;
	let thePDSResolver;
	const workflow: Workflow = getContext('workflow');
	const template: Template = getContext('template');
	const dispatch = createEventDispatcher();

	let doerHTML = '';
	if (nodeInfo.nodeProps.ACTION.doer) {
		let doerCode = Parser.base64ToCode(nodeInfo.nodeProps.ACTION.doer);
		let doerJSON = JSON.parse(doerCode);
		if (Array.isArray(doerJSON)) {
			for (let i = 0; i < doerJSON.length; i++) {
				if (i > 0) doerHTML += '; ';
				doerHTML = doerJSON[i].uid;
			}
		} else {
			doerHTML = doerJSON;
		}
	}

	let theTab = $filterStorage.tabs;
	if (['participant', 'instruct', 'variables'].includes(theTab) === false) {
		$filterStorage.tabs = 'participant';
	}

	const setTab = function (tabname, firstLevel = true) {
		if (firstLevel) $filterStorage.tabs = tabname;
		else $filterStorage.tabs2nd = tabname;

		if (tabname === 'tasks') {
			if (typeof workid === 'string' && workid !== '') {
				setTimeout(async () => {
					todos = (await api.post(
						'todos/by/workid',
						{ workid: workid },
						$session.user.sessionToken,
					)) as unknown as any[];
					todos = todos.map((x) => {
						x.newdoer = '';
						return x;
					});
				});
			} else {
				todos = [];
			}
		}
	};
	const isActive = function (tabname, firstLevel = true) {
		if (firstLevel) {
			let tabs = $filterStorage.tabs;
			if (!tabs) {
				tabs = 'participant';
				$filterStorage.tabs = 'participant';
			}
			return tabs.indexOf(tabname) > -1;
		} else {
			let tabs2nd = $filterStorage.tabs2nd;
			if (!tabs2nd) {
				tabs2nd = 'basic';
				$filterStorage.tabs2nd = 'basic';
			}
			return tabs2nd.indexOf(tabname) > -1;
		}
	};

	onMount(async () => {
		TimeTool = (await import('$lib/TimeTool')).default;
		import('bootstrap').then((bootstrap) => {
			const popoverTriggerList = [].slice.call(
				document.querySelectorAll('[data-bs-toggle="popover"]'),
			);
			const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
				return new bootstrap.Popover(popoverTriggerEl);
			});
		});
	});
	let user = $session.user;
	let previewInstruct = false;
</script>

<!--
{#if ClientPermControl(user.perms, user.email, 'template', template, 'update')}
	<NavLink
		class="kfk-link"
		on:click={async () => {
			if (readonly) {
				dispatch('editInProp', nodeInfo.nodeProps.ACTION.id);
			} else {
				dispatch('readInProp', nodeInfo.nodeProps.ACTION.id);
			}
		}}
	>
		{readonly ? $_('tpl.editit') : $_('tpl.viewit')}
	</NavLink>
{:else}
	<NavLink disabled>
		<Icon name={readonly ? 'pen' : 'eye'} />
		{readonly ? $_('tpl.editit') : $_('tpl.viewit')}
	</NavLink>
{/if}
-->
<Container>
	<Row cols="1" class="mb-3">
		<Col>
			<ChangeID
				{jq}
				bind:idForInput={nodeInfo.nodeProps.ACTION.id}
				{KFK}
				{readonly}
				on:changeNodeId />
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>
					{$_('prop.label')}
				</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.ACTION.label} disabled={readonly} />
			</InputGroup>
		</Col>
	</Row>
	<TabContent
		pills
		on:tab={(e) => {
			setTab(e.detail);
		}}>
		<TabPane
			tabId="participant"
			tab={$_('prop.action.tab.participant')}
			active={isActive('participant')}>
			<Col>
				<InputGroup size="sm">
					<Input
						id="chk_usercsv"
						type="checkbox"
						label={$_('prop.action.p10t.csv')}
						bind:checked={nodeInfo.nodeProps.ACTION.withcsv}
						disabled={readonly} />
					{#if nodeInfo.nodeProps.ACTION.withcsv}
						<Input
							class="ms-2"
							bind:value={nodeInfo.nodeProps.ACTION.csv}
							disabled={readonly}
							placeholder="csv variable name" />
					{/if}
				</InputGroup>
			</Col>
			<Col>
				<InputGroup size="sm">
					<Input
						id="chk_alldone"
						type="checkbox"
						label={$_('prop.action.p10t.alldone')}
						bind:checked={nodeInfo.nodeProps.ACTION.byall}
						disabled={readonly} />
				</InputGroup>
			</Col>
			{#if nodeInfo.nodeProps.ACTION.byall}
				<Col>
					<InputGroup size="sm">
						<Input type="select" bind:value={nodeInfo.nodeProps.ACTION.vote} disabled={readonly}>
							<option value="last">{$_('vote.last')}</option>
							<option value="most">{$_('vote.most')}</option>
							<option value="least">{$_('vote.least')}</option>
							<option value="allOrFailto">{$_('vote.allOrFailto')}</option>
							<option value="percentOrFailto">{$_('vote.percentOrFailto')}</option>
							<option value="ifAny">{$_('vote.ifAny')}</option>
							<option value="ifAnyThenMost">{$_('vote.ifAnyThenMost')}</option>
							<option value="ifAnyThenLeast">{$_('vote.ifAnyThenLeast')}</option>
							<option value="ifAnyThenAllThenMost">{$_('vote.ifAnyThenAllThenMost')}</option>
							<option value="ifAnyThenFailto">{$_('vote.ifAnyThenFailto')}</option>
						</Input>
					</InputGroup>
				</Col>
				<Col>
					<InputGroup size="sm">
						{#if ['ifAny', 'ifAnyThenMost', 'ifAnyThenLeast', 'ifAnyThenAllThenMost', 'ifAnyThenFailto', 'percentOrFailto'].includes(nodeInfo.nodeProps.ACTION.vote)}
							<InputGroupText>Any</InputGroupText>
							<Input bind:value={nodeInfo.nodeProps.ACTION.vote_any} />
						{/if}
						{#if ['percentOrFailto'].includes(nodeInfo.nodeProps.ACTION.vote)}
							<InputGroupText>Percentage</InputGroupText>
							<Input type="number" bind:value={nodeInfo.nodeProps.ACTION.vote_percent} />
						{/if}
						{#if ['allOrFailto', 'percentOrFailto', 'ifAnyThenFailto'].includes(nodeInfo.nodeProps.ACTION.vote)}
							<InputGroupText>Fail to</InputGroupText>
							<Input bind:value={nodeInfo.nodeProps.ACTION.vote_failto} />
						{/if}
					</InputGroup>
				</Col>
			{/if}
			<Col>
				<InputGroup size="sm">
					<Input
						id="chk_transferable"
						type="checkbox"
						label={$_('prop.action.p10t.transferable')}
						bind:checked={nodeInfo.nodeProps.ACTION.transferable}
						disabled={readonly} />
					<Input
						id="chk_sr"
						type="checkbox"
						class="ms-3"
						label={$_('prop.action.p10t.sr')}
						bind:checked={nodeInfo.nodeProps.ACTION.sr}
						disabled={readonly} />
				</InputGroup>
			</Col>
			<Col>
				<InputGroup>
					<Input
						id="chk_sendback"
						type="checkbox"
						label={$_('prop.action.p10t.withsb')}
						bind:checked={nodeInfo.nodeProps.ACTION.withsb}
						disabled={readonly} />
					<Input
						class="ms-1"
						id="chk_revoke"
						type="checkbox"
						label={$_('prop.action.p10t.withrvk')}
						bind:checked={nodeInfo.nodeProps.ACTION.withrvk}
						disabled={readonly} />
					<Input
						class="ms-1"
						id="chk_revoke"
						type="checkbox"
						label={$_('prop.action.p10t.withadhoc')}
						bind:checked={nodeInfo.nodeProps.ACTION.withadhoc}
						disabled={readonly} />
					<Input
						class="ms-1"
						id="chk_revoke"
						type="checkbox"
						label={$_('prop.action.p10t.withcmt')}
						bind:checked={nodeInfo.nodeProps.ACTION.withcmt}
						disabled={readonly} />
				</InputGroup>
			</Col>
			{#if nodeInfo.nodeProps.ACTION.withcsv === false}
				<Col>
					<div class="my-3">
						<RolePicker
							bind:role={nodeInfo.nodeProps.ACTION.role}
							bind:existingRoles={roleOptions}
							{readonly} />
					</div>
				</Col>
				{#if nodeInfo.nodeProps.ACTION.doer}
					<Col class="mb-2">
						Who: {doerHTML}
					</Col>
				{/if}
			{:else}
				<Col>
					<div class="my-3">Use participants defined in CSV.</div>
				</Col>
			{/if}
		</TabPane>
		<TabPane tabId="instruct" tab={$_('prop.action.tab.instruction')} active={isActive('instruct')}>
			<InputGroup size="sm">
				<Input
					type="textarea"
					style="height: 20em;"
					placeholder={$_('prop.action.placeholder.instruct')}
					bind:value={nodeInfo.nodeProps.ACTION.instruct}
					disabled={readonly} />
			</InputGroup>
			<Button
				color="primary"
				on:click={(e) => {
					previewInstruct = !previewInstruct;
				}}>
				{#if previewInstruct}
					Close Preview
				{:else}
					Preview (Variables will not be inteperated in preview)
				{/if}
			</Button>
			{#if previewInstruct === true}
				<div id="preview">
					{@html nodeInfo.nodeProps.ACTION.instruct}
				</div>
			{/if}
		</TabPane>
		<TabPane tabId="variables" tab={$_('prop.action.tab.variables')} active={isActive('variables')}>
			{#if !readonly}
				<InputGroup size="sm">
					<div>&nbsp;</div>
					<div class="ms-auto me-5">
						<Button
							color="primary"
							size="sm"
							disabled={readonly}
							on:click={(e) => {
								e.preventDefault();
								kvarsArr.push({
									name: '',
									label: '',
									value: '',
									breakrow: false,
									placeholder: '',
									required: true,
								});
								kvarsArr = kvarsArr;
							}}>
							{$_('prop.action.button.addnewvar')}
						</Button>
					</div>
					<div
						class="form-check"
						data-bs-trigger="hover"
						data-bs-toggle="popover"
						data-bs-placement="top"
						data-bs-title={$_('tips.designer.action.allowpbo.title')}
						data-bs-content={$_('tips.designer.action.allowpbo.content')}>
						<input
							placeholder=""
							class="form-check-input"
							id="chk_addpbo"
							type="checkbox"
							name=""
							value=""
							data-bs-original-title=""
							title="" />
						<label class="form-check-label" for="chk_addpbo">
							{$_('prop.action.p10t.allowpbo')}
						</label>
					</div>
				</InputGroup>
			{:else}
				<InputGroup size="sm">
					<Input
						id="chk_addpbo"
						class="ms-auto"
						type="checkbox"
						label={$_('prop.action.p10t.allowpbo')}
						bind:checked={nodeInfo.nodeProps.ACTION.allowpbo}
						disabled={readonly} />
				</InputGroup>
			{/if}
			{#each kvarsArr as kvar, index}
				<div class="px-0 py-2 my-2 d-flex kfk-highlight-2">
					<div class="my-1 flex-grow-1">
						<InputGroup size="sm">
							<InputGroupText>
								{$_('prop.action.kvar.name')}
							</InputGroupText>
							<Input
								bind:value={kvar.name}
								disabled={readonly}
								on:blur={(e) => {
									kvar.name = Parser.toValidVarName(kvar.name);
								}} />
							<InputGroupText>
								{$_('prop.action.kvar.label')}
							</InputGroupText>
							<Input bind:value={kvar.label} disabled={readonly} />
						</InputGroup>
						{#if kvar.name.startsWith('select_') || kvar.name.startsWith('sel_') || kvar.name.startsWith('sl_') || kvar.name.startsWith('radio_') || kvar.name.startsWith('ou_')}
							<InputGroup size="sm">
								<InputGroupText>
									{kvar.name.startsWith('ou_')
										? $_('prop.action.kvar.ou_options')
										: $_('prop.action.kvar.sel_options')}
								</InputGroupText>
								<Input
									bind:value={kvar.options}
									on:change={(e) => {
										kvar.options = qtb(kvar.options);
									}}
									disabled={readonly}
									placeholder={kvar.name.startsWith('ou_')
										? $_('prop.action.kvar.ou_placeholder')
										: $_('prop.action.kvar.sel_placeholder')} />
							</InputGroup>
						{:else if kvar.name.startsWith('number_')}
							<InputGroup size="sm">
								<InputGroupText>
									{$_('prop.action.kvar.number.min')}
								</InputGroupText>
								<Input bind:value={kvar.min} disabled={readonly} placeholder="" type="number" />
								<InputGroupText>
									{$_('prop.action.kvar.number.max')}
								</InputGroupText>
								<Input bind:value={kvar.max} disabled={readonly} placeholder="" type="number" />
								<InputGroupText>
									{$_('prop.action.kvar.number.step')}
								</InputGroupText>
								<Input bind:value={kvar.step} disabled={readonly} placeholder="" type="number" />
							</InputGroup>
						{:else if kvar.name.startsWith('tbl_')}
							<InputGroup size="sm">
								<InputGroupText>
									{$_('prop.action.kvar.tbl_options')}
								</InputGroupText>
								<Input
									bind:value={kvar.coldef}
									on:change={(e) => {
										kvar.coldef = qtb(kvar.coldef);
									}}
									disabled={readonly}
									placeholder={$_('prop.action.kvar.tbl_placeholder')} />
							</InputGroup>
							{#if !readonly}
								<TableDesigner bind:tableDefString={kvar.coldef} />
							{/if}
						{/if}

						<InputGroup size="sm">
							<InputGroupText>
								{$_('prop.action.kvar.value')}
							</InputGroupText>
							{#if kvar.name.startsWith('textarea_') || kvar.name.startsWith('ta_')}
								<Input type="textarea" bind:value={kvar.value} disabled={readonly} />
							{:else}
								<Input bind:value={kvar.value} disabled={readonly} />
							{/if}
							<InputGroupText>
								{$_('prop.action.kvar.when')}
							</InputGroupText>
							<Input bind:value={kvar.when} disabled={readonly} />
						</InputGroup>
						<PDSResolver bind:this={thePDSResolver} bind:value={kvar.visi} {readonly} />
						<InputGroup size="sm">
							<InputGroupText>
								{$_('prop.action.kvar.placeholder')}
							</InputGroupText>
							<Input bind:value={kvar.placeholder} disabled={readonly} />
							<InputGroupText>
								{$_('prop.action.kvar.required')}
							</InputGroupText>
							<Input type="checkbox" bind:checked={kvar.required} disabled={readonly} />
							<InputGroupText>
								{$_('prop.action.kvar.breakrow')}
							</InputGroupText>
							<Input type="checkbox" bind:checked={kvar.breakrow} disabled={readonly} />
							<InputGroupText>
								{$_('prop.action.kvar.ID')}
							</InputGroupText>
							<Input bind:value={kvar.id} disabled={readonly} />
						</InputGroup>
					</div>
					{#if !readonly}
						<div class="shrink">
							<table style="height: 100px; ">
								<tr>
									<td class="align-middle">
										<table>
											<tr>
												<td>
													<Button
														class="m-0 p-0"
														data-bs-trigger="hover"
														data-bs-toggle="popover"
														data-bs-placement="top"
														data-bs-title={$_('tips.designer.kvar.btn.dash.title')}
														data-bs-content={$_('tips.designer.kvar.btn.dash.content')}
														on:click={(e) => {
															e.preventDefault();
															kvarsArr.splice(index, 1);
															kvarsArr = kvarsArr;
														}}>
														<Icon name="dash" />
													</Button>
												</td>
												<td>
													<Button
														class="m-0 p-0"
														data-bs-trigger="hover"
														data-bs-toggle="popover"
														data-bs-placement="top"
														data-bs-title={$_('tips.designer.kvar.btn.plus.title')}
														data-bs-content={$_('tips.designer.kvar.btn.plus.content')}
														on:click={(e) => {
															e.preventDefault();
															kvarsArr.splice(index + 1, 0, {
																name: '',
																label: '',
																value: '',
																breakrow: false,
																placeholder: '',
																required: true,
															});
															kvarsArr = kvarsArr;
														}}>
														<Icon name="plus" />
													</Button>
												</td>
											</tr>
											<tr>
												<td>
													<Button
														class="m-0 p-0"
														data-bs-trigger="hover"
														data-bs-toggle="popover"
														data-bs-placement="top"
														data-bs-title={$_('tips.designer.kvar.btn.up.title')}
														data-bs-content={$_('tips.designer.kvar.btn.up.content')}
														on:click={(e) => {
															e.preventDefault();
															if (e.shiftKey === false) {
																if (index > 0) {
																	kvarsArr.splice(index - 1, 0, kvarsArr.splice(index, 1)[0]);
																}
															} else {
																kvarsArr.splice(index, 0, { ...kvarsArr[index] });
															}
															kvarsArr = kvarsArr;
														}}>
														<Icon name="chevron-up" />
													</Button>
												</td>
												<td>
													<Button
														class="m-0 p-0"
														data-bs-trigger="hover"
														data-bs-toggle="popover"
														data-bs-placement="top"
														data-bs-title={$_('tips.designer.kvar.btn.double-up.title')}
														data-bs-content={$_('tips.designer.kvar.btn.double-up.content')}
														on:click={(e) => {
															e.preventDefault();
															if (e.shiftKey === false) {
																if (index > 0) {
																	kvarsArr.splice(0, 0, kvarsArr.splice(index, 1)[0]);
																}
															} else {
																kvarsArr.splice(0, 0, { ...kvarsArr[index] });
															}
															kvarsArr = kvarsArr;
														}}>
														<Icon name="chevron-double-up" />
													</Button>
												</td>
											</tr>
											<tr>
												<td>
													<Button
														class="m-0 p-0"
														data-bs-trigger="hover"
														data-bs-toggle="popover"
														data-bs-placement="top"
														data-bs-title={$_('tips.designer.kvar.btn.down.title')}
														data-bs-content={$_('tips.designer.kvar.btn.down.content')}
														on:click={(e) => {
															e.preventDefault();
															if (e.shiftKey === false) {
																if (index < kvarsArr.length - 1) {
																	kvarsArr.splice(index + 1, 0, kvarsArr.splice(index, 1)[0]);
																}
															} else {
																kvarsArr.splice(index + 1, 0, { ...kvarsArr[index] });
															}
															kvarsArr = kvarsArr;
														}}>
														<Icon name="chevron-down" />
													</Button>
												</td>
												<td>
													<Button
														class="m-0 p-0"
														data-bs-trigger="hover"
														data-bs-toggle="popover"
														data-bs-placement="top"
														data-bs-title={$_('tips.designer.kvar.btn.double-down.title')}
														data-bs-content={$_('tips.designer.kvar.btn.double-down.content')}
														on:click={(e) => {
															e.preventDefault();
															if (e.shiftKey === false) {
																if (index < kvarsArr.length - 1) {
																	kvarsArr.push(kvarsArr.splice(index, 1)[0]);
																}
															} else {
																kvarsArr.push({ ...kvarsArr[index] });
															}
															kvarsArr = kvarsArr;
														}}>
														<Icon name="chevron-double-down" />
													</Button>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
						</div>
					{/if}
				</div>
			{/each}
		</TabPane>
		<TabPane tabId="code" tab={$_('prop.action.tab.code')} active={isActive('code')}>
			<InputGroup size="sm">
				<Input
					type="textarea"
					style="height: 20em;"
					placeholder={$_('prop.action.placeholder.code')}
					bind:value={nodeInfo.nodeProps.ACTION.code}
					disabled={readonly} />
			</InputGroup>
		</TabPane>
		<TabPane tabId="crontab" tab={$_('prop.action.tab.crontab')} active={isActive('crontab')}>
			<Row>
				<div class="">
					{$_('prop.action.cronrun.note')}
				</div>
			</Row>
			<Row>
				<div class="">
					<label>
						<input
							type="radio"
							bind:group={nodeInfo.nodeProps.ACTION.cronrun}
							name="mode_cronrun"
							value={0} />
						{$_('prop.action.cronrun.nocron')}
					</label>
				</div>
				<div class="">
					<label>
						<input
							type="radio"
							bind:group={nodeInfo.nodeProps.ACTION.cronrun}
							name="mode_cronrun"
							value={3} />
						{$_('prop.action.cronrun.byrepeaton')}
					</label>
				</div>
				{#if nodeInfo.nodeProps.ACTION.cronrun === 3}
					<Row>
						<InputGroup>
							<InputGroupText>
								{$_('prop.action.cronrun.repeaton1')}
							</InputGroupText>
							<Input
								id="repeaton1"
								type="text"
								bind:value={nodeInfo.nodeProps.ACTION.repeaton}
								disabled={readonly} />
							<InputGroupText>{$_('prop.action.cronrun.repeaton3')}</InputGroupText>
						</InputGroup>
					</Row>
				{/if}
				<div class="">
					<label>
						<input
							type="radio"
							bind:group={nodeInfo.nodeProps.ACTION.cronrun}
							name="mode_cronrun"
							value={2} />
						{$_('prop.action.cronrun.onlycron')}
					</label>
				</div>
				{#if nodeInfo.nodeProps.ACTION.cronrun === 2}
					<Row>
						<InputGroup>
							<InputGroupText>
								{$_('prop.action.cronrun.repeaton1')}
							</InputGroupText>
							<Input
								id="repeaton1"
								type="text"
								bind:value={nodeInfo.nodeProps.ACTION.repeaton}
								disabled={readonly} />
							<InputGroupText>{$_('prop.action.cronrun.repeaton2')}</InputGroupText>
						</InputGroup>
					</Row>
				{/if}
				<div class="">
					<label>
						<input
							type="radio"
							bind:group={nodeInfo.nodeProps.ACTION.cronrun}
							name="mode_cronrun"
							value={1} />
						{$_('prop.action.cronrun.runthencron')}
					</label>
				</div>
				{#if nodeInfo.nodeProps.ACTION.cronrun === 1}
					<Row>
						<InputGroup>
							<InputGroupText>
								{$_('prop.action.cronrun.repeaton1')}
							</InputGroupText>
							<Input
								id="repeaton1"
								type="text"
								bind:value={nodeInfo.nodeProps.ACTION.repeaton}
								disabled={readonly} />
							<InputGroupText>{$_('prop.action.cronrun.repeaton2')}</InputGroupText>
						</InputGroup>
					</Row>
				{/if}
			</Row>
			{#if nodeInfo.nodeProps.ACTION.cronrun === 1 || nodeInfo.nodeProps.ACTION.cronrun === 2}
				<Row class="border mt-3">
					<CronBuilder bind:cronexpr={nodeInfo.nodeProps.ACTION.cronexpr} />
				</Row>
			{/if}
		</TabPane>
		{#if scenario === 'workflow' && workid}
			<TabPane tabId="tasks" tab="Tasks" active={isActive('tasks')}>
				<Row>
					<Col class="d-flex justify-content-center">
						<InputGroup class="text-center">
							<Button
								class="my-1 w-100 btn-warning"
								on:click={async (e) => {
									e.preventDefault();
									await api.post(
										'work/reset',
										{
											wfid: workflow.wfid,
											workid: workid,
										},
										user.sessionToken,
									);
								}}>
								Reset <br />
								(Lab Function, may cause problems)
							</Button>
						</InputGroup>
					</Col>
				</Row>
				{#each todos as todo, index}
					<Row>
						{#if user.group === 'ADMIN' && todo.status === 'ST_RUN'}
							workid: {workid} / todoid: {todo.todoid}
							<br />
							status: {todo.status}
						{/if}
						{#if todo.status === 'ST_DONE'}
							<!-- if already ST_DONE -->
							<a
								href={`/work/${todo.todoid}`}
								target="_worktab"
								class="btn btn-sm clickable text-primary">
								<i class="bi bi-emoji-sunglasses" />
								{todo.cn}
								<sup>{TimeTool.format(todo.doneat, 'LLL')}</sup>
							</a>
						{:else}
							<!-- if not ST_DONE -->
							<a
								href={`/work/${todo.todoid}`}
								target="_worktab"
								class="btn btn-sm clickable text-primary">
								<i class="bi bi-emoji-expressionless" />
								{todo.cn}
							</a>

							{#if user.group === 'ADMIN' && todo.status === 'ST_RUN'}
								<InputGroup>
									<InputGroupText>Change to</InputGroupText>
									<Input bind:value={todo.newdoer} />
									<Button
										on:click={async (e) => {
											e.preventDefault();
											let ret = await api.post(
												'todo/set/doer',
												{
													todoid: todo.todoid,
													forall: false,
													doer: todo.doer,
													newdoer: todo.newdoer,
												},
												$session.user.sessionToken,
											);
											if (ret && ret.error) {
												console.error(ret.message);
											} else {
												todo.doer = ret.newdoer;
												todo.cn = ret.newcn;
											}
										}}>
										For this
									</Button>
									<Button
										on:click={async (e) => {
											e.preventDefault();
											let ret = await api.post(
												'todo/set/doer',
												{
													todoid: todo.todoid,
													forall: true,
													doer: todo.doer,
													newdoer: todo.newdoer,
												},
												$session.user.sessionToken,
											);
											if (ret && ret.error) {
												console.error(ret.message);
											} else {
												todo.doer = ret.newdoer;
												todo.cn = ret.newcn;
											}
										}}>
										For all
									</Button>
								</InputGroup>
							{/if}
							<!-- if ADMIN and ST_RUN, change doer -->
						{/if}
					</Row>
				{/each}
			</TabPane>
		{/if}
		<TabPane tabId="others" tab={$_('prop.action.tab.others')} active={isActive('others')}>
			<Row>
				<Col>
					<InputGroup size="sm">
						<InputGroupText>
							{$_('prop.bot')}
						</InputGroupText>
						<Input
							class="ms-1"
							type="checkbox"
							label="WECOM"
							bind:checked={nodeInfo.nodeProps.ACTION.bot.wecom}
							disabled={readonly} />
					</InputGroup>
				</Col>
			</Row>
		</TabPane>
		<!--variables-->
	</TabContent>
	<Row cols="1">
		<Col class="d-flex mt-3">
			<NavLink
				on:click={() => {
					helpShowing ? showHelp() : showHelp('ACTION');
					helpShowing = !helpShowing;
				}}
				class="ms-auto p-0 m-0">
				{#if helpShowing}
					<Icon name="chevron-left" />
					<Icon name="question-circle" />
				{:else}
					<Icon name="question-circle" />
					<Icon name="chevron-right" />
				{/if}
			</NavLink>
		</Col>
	</Row>
</Container>
