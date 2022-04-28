<!-- Transition.svelte -->
<script lang="ts">
	import { slide } from 'svelte/transition';

	export let enable: boolean = true;
	export let duration: number = 500;
	if (enable === undefined) enable = false;
</script>

{#if enable}
	<div in:slide={{ duration }}>
		<slot />
	</div>
{:else}
	<slot />
{/if}
