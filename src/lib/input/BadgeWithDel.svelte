<script type="ts">
	import { Badge, Icon } from 'sveltestrap';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let text;
	export let withDeleteButton = true;
</script>

<Badge pill color="light" class="kfk-tag text-primary border border-primary">
	{text}
	{#if withDeleteButton}
		<a href={'#'} on:click|preventDefault|stopPropagation={() => dispatch('delete', 'delete this')}>
			<Icon name="x" />
		</a>
	{/if}
</Badge>
