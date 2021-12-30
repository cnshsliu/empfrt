<script lang="ts">
	import Parser from '$lib/parser';
	import {
		NavLink,
		Button,
		Container,
		Row,
		Col,
		Icon,
		InputGroup,
		InputGroupText,
		Input
	} from 'sveltestrap';
	import { session } from '$app/stores';
	import Spinner from '$lib/Spinner.svelte';

	import * as api from '$lib/api';
	export let nodeInfo;
	export let showHelp;
	export let readonly;
	let helpShowing = false;
	let consoleMsg = 'abcd';
	let user = $session.user;
	let checkingStatus = '';
	let checkingMsg = '';
</script>

<Container>
	<Row cols="1">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Label</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.SCRIPT.label} disabled={readonly} />
			</InputGroup>
		</Col>
	</Row>
	<Row cols="1">
		<Col class="d-flex mt-2">
			<Input
				class="ms-1"
				type="radio"
				bind:group={nodeInfo.nodeProps.SCRIPT.runmode}
				value="SYNC"
				label="Sync Mode"
				disabled={readonly}
			/>
			<Input
				class="ms-1"
				type="radio"
				bind:group={nodeInfo.nodeProps.SCRIPT.runmode}
				value="ASYNC"
				label="Async Mode"
				disabled={readonly}
			/>
		</Col>
		<Col>
			<Input
				bind:value={nodeInfo.nodeProps.SCRIPT.code}
				type="textarea"
				class="kfk-code-input"
				disabled={readonly}
			/>
		</Col>
		<Col>
			<Row class="mt-2">
				<Col>
					<div class="justify-content-begin d-flex">
						<Spinner bind:status={checkingStatus} bind:msg={checkingMsg} />
					</div>
				</Col>
				<Col>
					<div class="justify-content-end d-flex">
						<Button
							disabled={readonly}
							on:click={async (e) => {
								e.preventDefault();
								checkingStatus = 'LOADING';
								checkingMsg = '';
								let ret = await api.post(
									'code/try',
									{ code: nodeInfo.nodeProps.SCRIPT.code },
									user.sessionToken
								);
								checkingStatus = '';
								if (ret.error) {
									consoleMsg = ret.message;
								} else {
									consoleMsg = ret.message;
								}
							}}
						>
							Try Run
						</Button>
					</div>
				</Col>
			</Row>
		</Col>
		{#if consoleMsg !== ''}
			<Col>
				<pre>
				<code>
					{consoleMsg}
				</code>
			</pre>
			</Col>
		{/if}
		<Col class="d-flex mt-3">
			<span class="kfk-property-id"> ID: {nodeInfo.nodeProps.SCRIPT.id} </span>
			<NavLink
				on:click={() => {
					helpShowing ? showHelp() : showHelp('SCRIPT');
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
