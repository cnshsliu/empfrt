<script lang="ts">
	import Parser from '$lib/parser';
	import { Container, Row, Col, InputGroup, InputGroupText, Input } from 'sveltestrap';

	export let nodeInfo;
	export let kvarsArr = [];
	export let roleOptions = [];
</script>

<Container>
	<Row>
		<Col>{nodeInfo.props.ACTION.label}</Col>
	</Row>
	<Row cols="1">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Label:</InputGroupText>
				<Input bind:value={nodeInfo.props.ACTION.label} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Role:</InputGroupText>
				<Input bind:value={nodeInfo.props.ACTION.role} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Pick an existing role:</InputGroupText>
				<Input
					type="select"
					bind:value={nodeInfo.props.ACTION.role}
					name="select"
					id="exampleSelect"
				>
					{#each roleOptions as aRoleOption}
						<option>{aRoleOption}</option>
					{/each}
				</Input>
			</InputGroup>
		</Col>
		<Col>Vars:</Col>
		<Col>
			<Container>
				<Row cols="1">
					{#each kvarsArr as kvar}
						<Col>
							<InputGroup size="sm">
								<InputGroupText>Name:</InputGroupText>
								<Input bind:value={kvar.name} />
							</InputGroup>
							<InputGroup size="sm">
								<InputGroupText>Value:</InputGroupText>
								<Input bind:value={kvar.value} />
							</InputGroup>
							<InputGroup size="sm">
								<InputGroupText>Label:</InputGroupText>
								<Input bind:value={kvar.label} />
							</InputGroup>
						</Col>
					{/each}
				</Row>
			</Container>
		</Col>
	</Row>
</Container>
