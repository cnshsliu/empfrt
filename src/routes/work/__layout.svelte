<script context="module">
	export async function load({ page, fetch, session }) {
		const { user } = session;
		if (!user) {
			console.log('work/__layout redirect to login', session);
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
	export let user: User;
</script>

<svelte:head>
	<title>{user.username} • Works</title>
</svelte:head>

<slot />
