<script lang="ts">
	import { _ } from '$lib/i18n';
	import Parser from '$lib/parser';
	import { filterStorage } from '$lib/empstores';
	import * as api from '$lib/api';
	import { session } from '$app/stores';
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
		TabContent
	} from 'sveltestrap';
	import type { KVarDefInput, Workflow } from '$lib/types';
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

	let TimeTool = null;
	let helpShowing = false;
	let thePDSResolver;
	const workflow: Workflow = getContext('workflow');

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
						$session.user.sessionToken
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
	});
	let user = $session.user;
	let previewInstruct = false;
</script>

<Container>
	<Row cols="1">
		<Col>
			<ChangeID {jq} bind:idForInput={nodeInfo.nodeProps.ACTION.id} {KFK} {readonly} />
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>
					{$_('prop.label')}
				</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.ACTION.label} disabled={readonly} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>
					{$_('prop.bot')}
				</InputGroupText>
				{$_('prop.bot_wecom')}
				<Input
					type="checkbox"
					bind:checked={nodeInfo.nodeProps.ACTION.bot.wecom}
					disabled={readonly}
				/>
			</InputGroup>
		</Col>
	</Row>
	<TabContent
		pills
		on:tab={(e) => {
			setTab(e.detail);
		}}
	>
		<TabPane
			tabId="participant"
			tab={$_('prop.action.tab.participant')}
			active={isActive('participant')}
		>
			<Col>
				<InputGroup size="sm">
					<Input
						id="chk_alldone"
						type="checkbox"
						label={$_('prop.action.p10t.alldone')}
						bind:checked={nodeInfo.nodeProps.ACTION.byall}
						disabled={readonly}
					/>
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
						disabled={readonly}
					/>
				</InputGroup>
			</Col>
			<Col>
				<InputGroup>
					<Input
						id="chk_sr"
						type="checkbox"
						label={$_('prop.action.p10t.sr')}
						bind:checked={nodeInfo.nodeProps.ACTION.sr}
						disabled={readonly}
					/>
				</InputGroup>
			</Col>
			<Col>
				<div class="my-3">
					<RolePicker
						bind:role={nodeInfo.nodeProps.ACTION.role}
						bind:existingRoles={roleOptions}
						{readonly}
					/>
				</div>
			</Col>
			{#if nodeInfo.nodeProps.ACTION.doer}
				<Col class="mb-2">
					Who: {doerHTML}
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
					disabled={readonly}
				/>
			</InputGroup>
			<Button
				color="primary"
				on:click={(e) => {
					previewInstruct = !previewInstruct;
				}}
			>
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
								required: true
							});
							kvarsArr = kvarsArr;
						}}
					>
						{$_('prop.action.button.addnewvar')}
					</Button>
				</InputGroup>
			{/if}
			{#each kvarsArr as kvar, index}
				<div class="px-2 py-2 my-2 d-flex kfk-highlight-2">
					<div class="my-1 flex-grow-1">
						<TabContent
							vertical
							pills
							on:tab={(e) => {
								setTab(e.detail, false);
							}}
						>
							<TabPane
								tabId="basic"
								class="w-100"
								tab={$_('prop.action.kvar.basic')}
								active={isActive('basic', false)}
							>
								<InputGroup size="sm">
									<InputGroupText>
										{$_('prop.action.kvar.name')}
									</InputGroupText>
									<Input
										bind:value={kvar.name}
										disabled={readonly}
										on:blur={(e) => {
											kvar.name = Parser.toValidVarName(kvar.name);
										}}
									/>
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
												: $_('prop.action.kvar.sel_placeholder')}
										/>
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
											placeholder={$_('prop.action.kvar.tbl_placeholder')}
										/>
									</InputGroup>
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
								</InputGroup>

								<InputGroup size="sm">
									<InputGroupText>
										{$_('prop.action.kvar.label')}
									</InputGroupText>
									<Input bind:value={kvar.label} disabled={readonly} />
								</InputGroup>
							</TabPane>
							<TabPane
								tabId="extra"
								class="w-100"
								tab={$_('prop.action.kvar.extra')}
								active={isActive('extra', false)}
							>
								<InputGroup size="sm">
									<InputGroupText>
										{$_('prop.action.kvar.placeholder')}
									</InputGroupText>
									<Input bind:value={kvar.placeholder} disabled={readonly} />
								</InputGroup>
								<InputGroup size="sm">
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
								<InputGroup size="sm">
									<InputGroupText>
										{$_('prop.action.kvar.when')}
									</InputGroupText>
									<Input bind:value={kvar.when} disabled={readonly} />
								</InputGroup>
								<PDSResolver bind:this={thePDSResolver} bind:value={kvar.visi} {readonly} />
							</TabPane>
						</TabContent>
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
														on:click={(e) => {
															e.preventDefault();
															kvarsArr.splice(index, 1);
															kvarsArr = kvarsArr;
														}}
													>
														<Icon name="dash" />
													</Button>
												</td><td>
													<Button
														class="m-0 p-0"
														on:click={(e) => {
															e.preventDefault();
															kvarsArr.splice(index + 1, 0, {
																name: '',
																label: '',
																value: '',
																breakrow: false,
																placeholder: '',
																required: true
															});
															kvarsArr = kvarsArr;
														}}
													>
														<Icon name="plus" />
													</Button>
												</td>
											</tr>
											<tr>
												<td>
													<Button
														class="m-0 p-0"
														on:click={(e) => {
															e.preventDefault();
															if (index > 0) {
																kvarsArr.splice(index - 1, 0, kvarsArr.splice(index, 1)[0]);
																kvarsArr = kvarsArr;
															}
														}}
													>
														<Icon name="chevron-up" />
													</Button>
												</td><td>
													<Button
														class="m-0 p-0"
														on:click={(e) => {
															e.preventDefault();
															if (index > 0) {
																kvarsArr.splice(0, 0, kvarsArr.splice(index, 1)[0]);
																kvarsArr = kvarsArr;
															}
														}}
													>
														<Icon name="chevron-double-up" />
													</Button>
												</td>
											</tr>
											<tr>
												<td>
													<Button
														class="m-0 p-0"
														on:click={(e) => {
															e.preventDefault();
															if (index < kvarsArr.length - 1) {
																kvarsArr.splice(index + 1, 0, kvarsArr.splice(index, 1)[0]);
																kvarsArr = kvarsArr;
															}
														}}
													>
														<Icon name="chevron-down" />
													</Button>
												</td>
												<td>
													<Button
														class="m-0 p-0"
														on:click={(e) => {
															e.preventDefault();
															if (index < kvarsArr.length - 1) {
																kvarsArr.push(kvarsArr.splice(index, 1)[0]);
																kvarsArr = kvarsArr;
															}
														}}
													>
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
		{#if scenario === 'workflow' && workid}
			<TabPane tabId="tasks" tab="Tasks" active={isActive('tasks')}>
				{#each todos as todo, index}
					<Row>
						{#if user.group === 'ADMIN' && todo.status === 'ST_RUN'}
							workid: {workid}<br />
							todoid: {todo.todoid}<br />
							status: {todo.status}
						{/if}
						{#if todo.status === 'ST_DONE'}
							<a
								href={`/work/@${todo.todoid}`}
								target="_worktab"
								class="btn btn-sm clickable text-primary"
							>
								<i class="bi bi-emoji-sunglasses" />{todo.cn}
								<sup>{TimeTool.format(todo.doneat, 'LLL')}</sup>
							</a>
						{:else}
							<a
								href={`/work/@${todo.todoid}`}
								target="_worktab"
								class="btn btn-sm clickable text-primary"
							>
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
													newdoer: todo.newdoer
												},
												$session.user.sessionToken
											);
											if (ret && ret.error) {
												console.error(ret.message);
											} else {
												todo.doer = ret.newdoer;
												todo.cn = ret.newcn;
											}
										}}>For this</Button
									>
									<Button
										on:click={async (e) => {
											e.preventDefault();
											let ret = await api.post(
												'todo/set/doer',
												{
													todoid: todo.todoid,
													forall: true,
													doer: todo.doer,
													newdoer: todo.newdoer
												},
												$session.user.sessionToken
											);
											if (ret && ret.error) {
												console.error(ret.message);
											} else {
												todo.doer = ret.newdoer;
												todo.cn = ret.newcn;
											}
										}}>For all</Button
									>
								</InputGroup>
							{/if}
						{/if}
					</Row>
				{/each}
			</TabPane>
		{/if}
		<!--variables-->
	</TabContent>
	<Row cols="1">
		<Col class="d-flex mt-3">
			<NavLink
				on:click={() => {
					helpShowing ? showHelp() : showHelp('ACTION');
					helpShowing = !helpShowing;
				}}
				class="ms-auto p-0 m-0"
			>
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
