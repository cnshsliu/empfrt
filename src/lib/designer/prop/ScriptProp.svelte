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

	export let nodeInfo;
	export let showHelp;
	let helpShowing = false;
</script>

<Container>
	<Row cols="1">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Label</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.SCRIPT.label} />
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
			/>
			<Input
				class="ms-1"
				type="radio"
				bind:group={nodeInfo.nodeProps.SCRIPT.runmode}
				value="ASYNC"
				label="Async Mode"
			/>
		</Col>
		<Col>
			<Input bind:value={nodeInfo.nodeProps.SCRIPT.code} type="textarea" class="kfk-code-input" />
		</Col>
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
