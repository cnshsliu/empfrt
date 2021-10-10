<script lang="ts">
	import { Container, Row, Col } from 'sveltestrap';
	export let open;
	const toggle = () => (open = !open);
</script>

<Container>
	<Row>
		<Col>ACTION</Col>
	</Row>
	<Row>
		<Col>DOIT</Col>
	</Row>
</Container>
