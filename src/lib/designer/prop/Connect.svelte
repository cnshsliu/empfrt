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
	export let showHelp;
	export let readonly;
	let helpShowing = false;
	if (Parser.isEmpty(nodeInfo.caseValue)) {
		nodeInfo.caseValue = '';
	}
</script>

<Container>
	<Row cols="1" class="mt-2">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Case Value</InputGroupText>
				<Input bind:value={nodeInfo.caseValue} disabled={readonly} />
			</InputGroup>
		</Col>
		<Col class="d-flex mt-3">
			<span class="kfk-property-id" />
			<NavLink
				on:click={() => {
					helpShowing ? showHelp() : showHelp('CONNECT');
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
