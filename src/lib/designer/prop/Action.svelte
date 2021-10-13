<script lang="ts">
	import KVars from '$lib/kvars';
	import { Container, Row, Col, InputGroup, InputGroupText, Input } from 'sveltestrap';

	export let props;
	export let kvarsArr = [];
</script>

<Container>
	<Row>
		<Col>{props.ACTION.label}</Col>
	</Row>
	<Row cols="1">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Label:</InputGroupText>
				<Input bind:value={props.ACTION.label} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Role:</InputGroupText>
				<Input bind:value={props.ACTION.role} />
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
