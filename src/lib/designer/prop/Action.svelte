<script lang="ts">
	import { Container, Row, Col, InputGroup, InputGroupText, Input } from 'sveltestrap';

	export let props;
</script>

<Container>
	<Row>
		<Col>ACTION</Col>
	</Row>
	<Row>
		<Col>{JSON.stringify(props.ACTION)}</Col>
	</Row>
	<Row cols="1">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Label:</InputGroupText>
				<Input bind:value={props.ACTION.label} />
			</InputGroup>
		</Col>
	</Row>
</Container>
