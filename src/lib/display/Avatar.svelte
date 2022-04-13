<svelte:options accessors />

<script lang="ts">
	import { API_SERVER } from '$lib/Env';
	import { session } from '$app/stores';
	import * as api from '$lib/api';
	import { onMount } from 'svelte';
	export let uid;
	export let uname;
	export let style;
	let avatar;
	export let refresh = async function () {
		const opts: any = { method: 'GET', headers: {} };
		try {
			let response = await fetch(`${API_SERVER}/account/avatar/${uid}`, opts as RequestInit);
			const imageBlob = await response.blob();
			const reader = new FileReader();
			reader.readAsDataURL(imageBlob);
			reader.onloadend = () => {
				avatar = reader.result;
			};
		} catch (err) {}
	};
	onMount(async () => {
		await refresh();
		console.log($session.user);
	});
</script>

{#if avatar}
	<img src={avatar} class={style} alt="avatar" />
{:else}
	<div class="kfk-avatar-letter-small text-center">
		{uname ? uname : ' '}
	</div>
{/if}
