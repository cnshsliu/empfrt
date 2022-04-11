<script context="module" lang="ts">
	import { locale, _ } from '$lib/i18n';
	import { tick, onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	export const ssr = false;
	export async function load({ session }) {
		return {
			props: {
				user: session.user
			}
		};
	}
</script>

<script lang="ts">
	import PublicIndex from './public.svelte';
	export let user;
</script>

<PublicIndex {user} />
