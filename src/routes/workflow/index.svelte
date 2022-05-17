<script context="module" lang="ts">
	export async function load({ url, params, fetch, session }) {
		return {
			props: {
				user: session.user,
			},
		};
	}
</script>

<script lang="ts">
	import { _ } from '$lib/i18n';
	import RemoteTable from './RemoteTable.svelte';
	import { Button, Container, Row, Col } from 'sveltestrap';
	import { title } from '$lib/title';
	$title = 'Process';
</script>

<Container>
	<RemoteTable endpoint="workflow/search" />
</Container>
