<script lang="ts">
	import Parser from '$lib/parser';
	import { Container, Row, Col, InputGroup, InputGroupText, Input } from 'sveltestrap';

	export let nodeInfo;
	if (Parser.isEmpty(nodeInfo.caseValue)) {
		nodeInfo.caseValue = '';
	}
</script>

<Container>
	<Row cols="1" class="mt-2">
		<Col>
			<InputGroup size="sm">
				<InputGroupText>Case Value</InputGroupText>
				<Input bind:value={nodeInfo.caseValue} />
			</InputGroup>
		</Col>
	</Row>
</Container>
