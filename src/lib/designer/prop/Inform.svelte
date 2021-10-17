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
	export let roleOptions = [];
	export let showHelp;
	let helpShowing = false;
</script>

<Container>
	<Row cols="1">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Label</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.label} />
			</InputGroup>
		</Col>
	</Row>
	<Row cols="1">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>To Role</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.INFORM.role} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Pick an existing role</InputGroupText>
				<Input
					type="select"
					bind:value={nodeInfo.nodeProps.INFORM.role}
					name="select"
					id="exampleSelect"
				>
					{#each roleOptions as aRoleOption}
						<option>{aRoleOption}</option>
					{/each}
				</Input>
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Subject</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.INFORM.subject} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Content</InputGroupText>
				<Input
					bind:value={nodeInfo.nodeProps.INFORM.content}
					type="textarea"
					class="kfk-code-input"
				/>
			</InputGroup>
		</Col>
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
