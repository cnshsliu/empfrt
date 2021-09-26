<script context="module">
	export async function load({ page, fetch, session }) {
		const { user } = session;
		if (!user) {
			return {
				status: 302,
				redirect: '/login'
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
	<title>{user.username} • Teams</title>
</svelte:head>

<slot />
