<script lang="ts">
	import Parser from '$lib/parser';
	import { Container, Row, Col, InputGroup, InputGroupText, Input } from 'sveltestrap';

	export let nodeInfo;
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
				<Input bind:value={nodeInfo.nodeProps.label} />
			</InputGroup>
		</Col>
		<Col>
			<InputGroup size="sm">
				<InputGroupText>SUB</InputGroupText>
				<Input bind:value={nodeInfo.nodeProps.SUB.sub} />
			</InputGroup>
		</Col>
	</Row>
	<Row class="mt-3">
		<Col class="kfk-property-id">ID: {nodeInfo.nodeProps.SUB.id}</Col>
	</Row>
</Container>
