<svelte:options accessors />

<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import { session } from '$app/stores';
	import * as api from '$lib/api';
	import { tick, onMount } from 'svelte';
	export let email;
	export let uname;
	export let style;
	let avatar = true;
	let tenant = $session.user.tenant._id;
	let imgUrl = `${API_SERVER}/account/avatar/${tenant}/${email}?token=${$session.user.sessionToken}`;
	onMount(async () => {});
	export const refresh = () => {
		avatar = true;
		imgUrl = imgUrl + '&t=' + new Date().getTime();
	};
</script>

{#if avatar}
	<img
		src={imgUrl}
		class={style}
		alt="avatar"
		on:error={(e) => {
			console.error(e);
			avatar = false;
		}} />
{:else}
	<div class="kfk-avatar-letter-small text-center">
		{uname ? uname : ' '}
	</div>
{/if}
