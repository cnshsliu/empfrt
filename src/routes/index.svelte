<script context="module" lang="ts">
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
