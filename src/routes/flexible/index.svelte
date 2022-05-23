<script lang="ts">
	import * as api from '$lib/api';
	import { tick } from 'svelte';
	import { _, mtcDate } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import { setFadeMessage } from '$lib/Notifier';
	import Confirm from '$lib/confirm.svelte';
	import Avatar from '$lib/display/Avatar.svelte';
	import type { User, Work } from '$lib/types';
	import { title } from '$lib/title';
	import { onMount, onDestroy } from 'svelte';
	import { printing, notifyMessage, worklistChangeFlag } from '$lib/Stores';
	import { mtcConfirm, mtcConfirmReset } from '$lib/Stores';
	import { version } from '$lib/empstores';
	import ErrorNotify from '$lib/ErrorNotify.svelte';
	import { StatusClass, StatusLabel } from '$lib/status';
	import { Container, Row, Col } from 'sveltestrap';

	onMount(async () => {});

	let user = $session.user;
	let flexible = { name: '' };

	const startFlexible = async () => {
		let res = await api.post('flexible/start', flexible, user.sessionToken);
		if (res.error) {
			setFadeMessage(res.message, 'warning');
		} else {
			setFadeMessage($_('flexible.res_success'));
		}
	};
</script>

<Container class={'mt-2'}>
	<div class="d-flex">
		<div class="flex-shrink-0" id="todo_title_area">
			<h3>{$_('flexible.btn_showform')}</h3>
		</div>
	</div>

	<input class="form-control" bind:value={flexible.name} placeholder={$_('flexible.placeholder')} />
	<div
		class="btn btn-primary"
		on:click|preventDefault={(e) => {
			startFlexible();
		}}>
		{$_('flexible.btn_create')}
	</div>
</Container>
