<svelte:options accessors />

<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import { session } from '$app/stores';
	import * as api from '$lib/api';
	import { tick, onMount } from 'svelte';
	export let uid;
	export let uname;
	export let style;
	let avatar = true;
	onMount(async () => {});
</script>

{#if avatar}
	<img
		src={`${API_SERVER}/account/avatar/${uid}`}
		class={style}
		alt="avatar"
		on:error={(e) => {
			avatar = false;
		}}
	/>
{:else}
	<div class="kfk-avatar-letter-small text-center">
		{uname ? uname : ' '}
	</div>
{/if}
