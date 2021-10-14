<script lang="ts">
	import Parser from '$lib/parser';
	import { Container, Row, Col, InputGroup, InputGroupText, Input } from 'sveltestrap';

	export let nodeInfo;
</script>

<Container>
	<Row>
		<Col>{nodeInfo.props.label}</Col>
	</Row>
	<Row cols="1">
		<Col>
			<Input bind:value={nodeInfo.props.SCRIPT.code} type="textarea" class="kfk-code-input" />
		</Col>
	</Row>
</Container>
