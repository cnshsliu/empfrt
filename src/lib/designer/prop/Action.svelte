<script lang="ts">
	import Parser from '$lib/parser';
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
	<TabContent pills>
		<TabPane tabId="participant" tab="Participant" active>
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
		<TabPane tabId="instruct" tab="Instruction">
			<InputGroup size="sm">
				<Input
					type="textarea"
					placeholder="in Markdown format"
					bind:value={nodeInfo.nodeProps.ACTION.instruct}
					disabled={readonly}
				/>
			</InputGroup>
		</TabPane>
		<TabPane tabId="varaibles" tab="Variables">
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
									value: ''
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
						<div class="d-flex">
							<div class="mt-2 flex-grow-1">
								<InputGroup size="sm">
									<InputGroupText>Name</InputGroupText>
									<Input bind:value={kvar.name} disabled={readonly} />
								</InputGroup>
								<InputGroup size="sm">
									<InputGroupText>Value</InputGroupText>
									<Input bind:value={kvar.value} disabled={readonly} />
								</InputGroup>
								<InputGroup size="sm">
									<InputGroupText>Label</InputGroupText>
									<Input bind:value={kvar.label} disabled={readonly} />
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
																		value: ''
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
