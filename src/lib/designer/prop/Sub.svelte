<script lang="ts">
	import { _ } from '$lib/i18n';
	import Parser from '$lib/parser';
	import ChangeID from './ChangeID.svelte';
	import {
		NavLink,
		Icon,
		Container,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Input,
	} from 'sveltestrap';

	export let nodeInfo;
	export let errMsg;
	export let showHelp;
	export let readonly;
	export let jq;
	export let KFK;
	let helpShowing = false;
	let timerCodePrefix = '+';
	if (Parser.isEmpty(nodeInfo.nodeProps.SUB.sub)) {
		nodeInfo.nodeProps.SUB.sub = '';
	}
</script>

<Container>
	<Row cols="1" class="mt-2">
		<ChangeID {jq} bind:idForInput={nodeInfo.nodeProps.SUB.id} {KFK} {readonly} on:changeNodeId />
		<Col>
			<InputGroup size="sm">
				<InputGroupText>
					{$_('prop.label')}
				</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.label} disabled={readonly} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>
					{$_('prop.sub.SUB')}
				</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.SUB.sub} disabled={readonly} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>
					{$_('prop.sub.standalone')}
				</InputGroupText>
				<Input type="checkbox" bind:checked={nodeInfo.nodeProps.SUB.alone} disabled={readonly} />
			</InputGroup>
		</Col>
		<Col>
			{errMsg}
		</Col>
		<Col class="d-flex mt-3">
			<NavLink
				on:click={() => {
					helpShowing ? showHelp() : showHelp('SUB');
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
