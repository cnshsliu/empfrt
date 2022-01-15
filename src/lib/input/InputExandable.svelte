<script type="ts">
	import { Input, InputGroup, Button, Badge, Icon } from 'sveltestrap';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	let showInput = false;
	export let value;

	function valueChagned() {
		dispatch('input', value);
		showInput = false;
		value = '';
	}
</script>

{#if showInput === false}
	<a href={'#'} on:click|preventDefault|stopPropagation={() => (showInput = true)}>
		<Icon name="plus" />
	</a>
{:else}
	<InputGroup>
		<Input bind:value placeholder="separate with blank/;/," on:change={valueChagned} />
		<Button on:click={valueChagned}>Set</Button>
		<Button on:click={() => (showInput = false)}>Close</Button>
	</InputGroup>
{/if}
