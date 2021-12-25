<script lang="ts">
	import Parser from '$lib/parser';
	import { filterStore } from '$lib/empstores';
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
	import RolePicker from '$lib/designer/prop/RolePicker.svelte';

	export let nodeInfo;
	export let kvarsArr: KvarInput[];
	export let roleOptions = [];
	export let showHelp;
	export let readonly;
	export let setFadeMessage;
	let helpShowing = false;

	let doerHTML = '';
	console.log(nodeInfo.nodeProps.ACTION.doer);
	if (nodeInfo.nodeProps.ACTION.doer) {
		let doerCode = Parser.base64ToCode(nodeInfo.nodeProps.ACTION.doer);
		let doerJSON = JSON.parse(doerCode);
		console.log(doerJSON);
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
			<Col class="mt-3 mt-1">
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
				<Container>
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
										{#if kvar.name.startsWith('select_') || kvar.name.startsWith('radio_') || kvar.name.startsWith('cb_') || kvar.name.startsWith('checkbox_')}
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
				</Container>
			</Col>
		</TabPane>
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
