<script context="module">
	export async function load({ url, params, fetch, session }) {
		const { user } = session;
		if (!user) {
			return {
				status: 302,
				redirect: '/'
			};
		}
		return {
			props: {
				user
			}
		};
	}
</script>

<script lang="ts">
	import type { User } from '$lib/types';
	export let user: User;
</script>

<svelte:head>
	<title>{user.username} • Works</title>
</svelte:head>

<slot />
