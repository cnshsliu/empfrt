<script type="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let index = 0;

	function onClick(event) {
		dispatch('click', event);
	}
</script>

<tr
	on:click={onClick}
	class={$$props.class}
	class:kfk-odd={index % 2 !== 0}
	class:kfk-even={index % 2 === 0}
	class:tnt-odd={index % 2 !== 0}
	class:tnt-even={index % 2 === 0}
>
	<slot />
</tr>
