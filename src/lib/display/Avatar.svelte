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
	let imgUrl = `${API_SERVER}/account/avatar/${uid}`;
	onMount(async () => {});
	export const refresh = () => {
		console.log('Refresh avatar');
		avatar = true;
		imgUrl = `${API_SERVER}/account/avatar/${uid}`;
		imgUrl = imgUrl + '?t=' + new Date().getTime();
	};
</script>

{#if avatar}
	<img
		src={imgUrl}
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
