<!-- Transition.svelte -->
<script lang="ts">
	export let enable: boolean = true;
	export let duration: number = 500;
	export let effect: any;
	if (enable === undefined) enable = false;
</script>

{#if enable}
	<div in:effect={{ duration }}>
		<slot />
	</div>
{:else}
	<slot />
{/if}
