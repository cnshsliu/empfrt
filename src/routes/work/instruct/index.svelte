<script context="module" lang="ts">
	import { post } from '$lib/utils';
	export async function load({ page, fetch, session }) {
		return {
			props: {
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import type { User, Work } from '$lib/types';
	import { onMount } from 'svelte';
	export let user: User;
	export let work: Work;

	onMount(() => {
		top.postMessage('After onmount');
	});
</script>

{user.username}
{work && work.name}

<div style="height:10px;" />
{user.username}
{work && work.name}

<div style="height:10px;" />
{user.username}
{work && work.name}

<div style="height:10px;" />
{user.username}
{work && work.name}

<div style="height:10px;" />
{user.username}
{work && work.name}

<div style="height:10px;" />
{user.username}
{work && work.name}

<div style="height:10px;" />
{user.username}
{work && work.name}

<div style="height:10px;" />
{user.username}
{work && work.name}

<div style="height:10px;" />

<style>
	body {
		margin: 0;
		padding: 0;
	}
</style>
