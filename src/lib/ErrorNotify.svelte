<script lang="ts">
	import {
		Container,
		Card,
		CardBody,
		CardFooter,
		CardHeader,
		CardSubtitle,
		CardText,
		CardTitle,
		Button
	} from 'sveltestrap';
	export let title: string;
	export let subtitle: string;
	export let info: string;
	export let callback: () => void;
	export let btnTitle: string;
	export let footer: string = null;
</script>

<Container class="mt-5">
	<Card class="mt-5">
		<CardHeader>
			<CardTitle>{title}</CardTitle>
		</CardHeader>
		<CardBody>
			<CardSubtitle>{subtitle}</CardSubtitle>
			<CardText>{info}</CardText>
			<Button
				on:click={(e) => {
					e.preventDefault();
					callback(e);
				}}
			>
				{btnTitle}
			</Button>
		</CardBody>
		{#if footer}
			<CardFooter>{footer}</CardFooter>
		{/if}
	</Card>
</Container>
