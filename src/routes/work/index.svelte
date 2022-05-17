<script lang="ts">
	import { _ } from '$lib/i18n';
	import { post } from '$lib/utils';
	import { goto } from '$app/navigation';
	import RemoteTable from './RemoteTable.svelte';
	import * as api from '$lib/api';
	import Parser from '$lib/parser';
	import type { User, Work } from '$lib/types';
	import { session } from '$app/stores';
	import { mtcConfirm, mtcConfirmReset } from '$lib/Stores';
	import { Container, Row, Col, Button, FormGroup, Input } from 'sveltestrap';
	import { onMount, onDestroy } from 'svelte';
	import { title } from '$lib/title';

	$title = 'HyperFlow';

	if ($session.user.tenant._id === undefined) {
		setTimeout(async () => {
			$mtcConfirm = {
				title: $_('confirm.title.needReload'),
				body: $_('confirm.body.needReload'),
				buttons: [$_('confirm.button.confirm')],
				callbacks: [
					async () => {
						window.location.reload();
						mtcConfirmReset();
					},
				],
			};
		}, 5000);
	}
</script>

<Container>
	<RemoteTable endpoint="work/list" />
</Container>
