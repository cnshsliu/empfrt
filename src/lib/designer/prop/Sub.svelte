<script lang="ts">
	import Parser from '$lib/parser';
	import {
		NavLink,
		Icon,
		Container,
		Row,
		Col,
		InputGroup,
		InputGroupText,
		Input
	} from 'sveltestrap';

	export let nodeInfo;
	export let errMsg;
	export let showHelp;
	export let readonly;
	let helpShowing = false;
	let timerCodePrefix = '+';
	if (Parser.isEmpty(nodeInfo.nodeProps.SUB.sub)) {
		nodeInfo.nodeProps.SUB.sub = '';
	}
</script>

<Container>
	<Row cols="1" class="mt-2">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Label</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.label} disabled={readonly} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>SUB</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.SUB.sub} disabled={readonly} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Standalone</InputGroupText>
				<Input type="checkbox" bind:checked={nodeInfo.nodeProps.SUB.alone} disabled={readonly} />
			</InputGroup>
		</Col>
		<Col>
			{errMsg}
		</Col>
		<Col class="d-flex mt-3">
			<span class="kfk-property-id"> ID: {nodeInfo.nodeProps.SUB.id} </span>
			<NavLink
				on:click={() => {
					helpShowing ? showHelp() : showHelp('SUB');
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
