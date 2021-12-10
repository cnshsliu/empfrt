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
		Input,
		TabContent,
		TabPane
	} from 'sveltestrap';
	import RolePicker from '$lib/designer/prop/RolePicker.svelte';

	export let nodeInfo;
	export let roleOptions = [];
	export let showHelp;
	export let readonly;
	let helpShowing = false;
</script>

<Container>
	<Row cols="1">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Label</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.label} disabled={readonly} />
			</InputGroup>
		</Col>
	</Row>
	<TabContent pills>
		<TabPane tabId="recipient" tab="Recipient" active>
			<Col>
				<RolePicker
					bind:role={nodeInfo.nodeProps.INFORM.role}
					bind:existingRoles={roleOptions}
					{readonly}
				/>
			</Col>
		</TabPane>
		<TabPane tabId="content" tab="Content" active>
			<Row cols="1">
				<Col>
					<InputGroup size="sm">
						<InputGroupText>Subject</InputGroupText>
						<Input bind:value={nodeInfo.nodeProps.INFORM.subject} disabled={readonly} />
					</InputGroup>
				</Col>
				<Col>
					<InputGroup size="sm">
						<InputGroupText>Content</InputGroupText>
						<Input
							bind:value={nodeInfo.nodeProps.INFORM.content}
							type="textarea"
							class="kfk-code-input"
							disabled={readonly}
						/>
					</InputGroup>
				</Col>
			</Row>
		</TabPane>
	</TabContent>
	<Row>
		<Col class="d-flex mt-3">
			<span class="kfk-property-id"> ID: {nodeInfo.nodeProps.INFORM.id} </span>
			<NavLink
				on:click={() => {
					helpShowing ? showHelp() : showHelp('INFORM');
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
