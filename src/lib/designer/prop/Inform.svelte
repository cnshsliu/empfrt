<script lang="ts">
	import Parser from '$lib/parser';
	import { Container, Row, Col, InputGroup, InputGroupText, Input } from 'sveltestrap';

	export let nodeInfo;
	export let roleOptions = [];
</script>

<Container>
	<Row>
		<Col>{nodeInfo.props.label}</Col>
	</Row>
	<Row cols="1">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>To Role:</InputGroupText>
				<Input bind:value={nodeInfo.props.INFORM.role} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Pick an existing role:</InputGroupText>
				<Input
					type="select"
					bind:value={nodeInfo.props.INFORM.role}
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
				<InputGroupText>Subject:</InputGroupText>
				<Input bind:value={nodeInfo.props.INFORM.subject} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Content:</InputGroupText>
				<Input bind:value={nodeInfo.props.INFORM.content} type="textarea" class="kfk-code-input" />
			</InputGroup>
		</Col>
	</Row>
</Container>
