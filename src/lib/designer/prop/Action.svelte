<script lang="ts">
	import Parser from '$lib/parser';
	import { filterStore } from '$lib/empstores';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';
	import { session } from '$app/stores';
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
	import type { KvarInput } from '$lib/types';
	import { onMount } from 'svelte';
	import RolePicker from '$lib/designer/prop/RolePicker.svelte';

	export let nodeInfo;
	export let kvarsArr: KvarInput[];
	export let roleOptions = [];
	export let showHelp;
	export let readonly;
	export let setFadeMessage;
	export let scenario;
	export let workid;
	let todos = [];

	let TimeTool = null;
	let helpShowing = false;

	console.log(nodeInfo.toString());

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

	let theTab = $filterStore.tabs;
	if (['participant', 'instruct', 'variables'].includes(theTab) === false) {
		$filterStore.tabs = 'participant';
	}

	const setTab = function (tabname, firstLevel = true) {
		if (firstLevel) $filterStore.tabs = tabname;
		else $filterStore.tabs2nd = tabname;

		if (tabname === 'tasks') {
			if (typeof workid === 'string' && workid !== '') {
				console.log(workid);
				setTimeout(async () => {
					todos = (await api.post(
						'todos/by/workid',
						{ workid: workid },
						$session.user.sessionToken
					)) as unknown as any[];
				});
			} else {
				todos = [];
			}
		}
	};
	const isActive = function (tabname, firstLevel = true) {
		if (firstLevel) {
			let tabs = $filterStore.tabs;
			if (!tabs) {
				tabs = 'participant';
				$filterStore.tabs = 'participant';
			}
			return tabs.indexOf(tabname) > -1;
		} else {
			let tabs2nd = $filterStore.tabs2nd;
			if (!tabs2nd) {
				tabs2nd = 'basic';
				$filterStore.tabs2nd = 'basic';
			}
			return tabs2nd.indexOf(tabname) > -1;
		}
	};

	onMount(async () => {
		TimeTool = (await import('$lib/TimeTool')).default;
		console.log(workid);
	});
</script>

<Container>
	<Row cols="1">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Label</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.ACTION.label} disabled={readonly} />
			</InputGroup>
		</Col>
	</Row>
	<TabContent
		pills
		on:tab={(e) => {
			setTab(e.detail);
		}}
	>
		<TabPane tabId="participant" tab="Participant" active={isActive('participant')}>
			<Col>
				<InputGroup size="sm">
					<Input
						id="c1"
						type="checkbox"
						label="Only finish on ALL-Done?"
						bind:checked={nodeInfo.nodeProps.ACTION.byall}
						disabled={readonly}
					/>
				</InputGroup>
			</Col>
			<Col>
				<InputGroup size="sm">
					<Input
						id="t1"
						type="checkbox"
						label="Transferable"
						bind:checked={nodeInfo.nodeProps.ACTION.transferable}
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
						{setFadeMessage}
					/>
				</div>
			</Col>
			{#if nodeInfo.nodeProps.ACTION.doer}
				<Col class="mb-2">
					Who: {doerHTML}
				</Col>
			{/if}
		</TabPane>
		<TabPane tabId="instruct" tab="Instruction" active={isActive('instruct')}>
			<InputGroup size="sm">
				<Input
					type="textarea"
					placeholder="support simple HTML and Handlebars"
					bind:value={nodeInfo.nodeProps.ACTION.instruct}
					disabled={readonly}
				/>
			</InputGroup>
		</TabPane>
		<TabPane tabId="variables" tab="Variables" active={isActive('variables')}>
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
						+ Add new variable
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
							<TabPane tabId="basic" tab="Basic" active={isActive('basic', false)}>
								<InputGroup size="sm">
									<InputGroupText>Name</InputGroupText>
									<Input bind:value={kvar.name} disabled={readonly} />
								</InputGroup>
								{#if kvar.name.startsWith('select_') || kvar.name.startsWith('radio_')}
									<InputGroup size="sm">
										<InputGroupText>Options</InputGroupText>
										<Input bind:value={kvar.options} disabled={readonly} placeholder="a;b;c" />
									</InputGroup>
								{/if}
								<InputGroup size="sm">
									<InputGroupText>Value</InputGroupText>
									<Input bind:value={kvar.value} disabled={readonly} />
								</InputGroup>
								<InputGroup size="sm">
									<InputGroupText>Label</InputGroupText>
									<Input bind:value={kvar.label} disabled={readonly} />
								</InputGroup>
							</TabPane>
							<TabPane tabId="extra" tab="Extra" active={isActive('extra', false)}>
								<InputGroup size="sm">
									<InputGroupText>Placeholder</InputGroupText>
									<Input bind:value={kvar.placeholder} disabled={readonly} />
								</InputGroup>
								<InputGroup size="sm">
									<InputGroupText>Break row</InputGroupText>
									<Input type="checkbox" bind:checked={kvar.breakrow} disabled={readonly} />
								</InputGroup>
								<InputGroup size="sm">
									<InputGroupText>ID</InputGroupText>
									<Input bind:value={kvar.id} disabled={readonly} />
								</InputGroup>
								<InputGroup size="sm">
									<InputGroupText>Required</InputGroupText>
									<Input type="checkbox" bind:checked={kvar.required} disabled={readonly} />
								</InputGroup>
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
															kvarsArr.splice(index, 0, {
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
						<a
							href={`/work/@${todo.todoid}`}
							target="_worktab"
							class="btn btn-sm clickable text-primary"
						>
							{#if todo.status === 'ST_DONE'}
								<i class="bi bi-emoji-sunglasses" />{todo.cn}
								<sup>{TimeTool.format(todo.doneat, 'LLL')}</sup>
							{:else}
								<i class="bi bi-emoji-expressionless" />{todo.cn}
							{/if}
						</a>
					</Row>
				{/each}
			</TabPane>
		{/if}
		<!--variables-->
	</TabContent>
	<Row>
		<Col class="d-flex mt-3">
			<span class="kfk-property-id"> ID: {nodeInfo.nodeProps.ACTION.id} </span>
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
