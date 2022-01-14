<script lang="ts">
	import * as api from '$lib/api';
	import { ModalHeader, ModalBody, Modal, ModalFooter, Button } from 'sveltestrap';
	import { session } from '$app/stores';
	let openPDsResolver = false;
	const togglePDsResolver = () => (openPDsResolver = !openPDsResolver);
	let theRole = '';
	let thePeople = [{ uid: '', cn: '' }];
	let theError = null;
	let theErrKey = null;
	function showPeople(role, people) {
		theError = null;
		theRole = role;
		thePeople = people;
		openPDsResolver = true;
	}
	function showError(errKey, err) {
		theErrKey = errKey;
		theError = err;
	}

	/**
	 * 	export asyncresolve() Resolve RDS
	 *
	 * @param {...} 	export asyncrds -
	 * @param {...} teamid - use this teamid if wfid is absent
	 * @param {...} email - use this email if wfid is absent
	 * @param {...} wfid - optinnal, use wf.teamid and wf.starter if presents
	 *
	 * @return {...}
	 */
	export async function resolve(payload) {
		if (!payload.rds || payload.rds.trim().length === 0) {
			console.warn('Resolver: no rds specified');
			return;
		}
		let res = await api.post('explain/pds', payload, $session.user.sessionToken);
		if (res.error) {
			showError(res.error, res.message);
		} else {
			showPeople(payload.rds, res);
		}
	}
</script>

<Modal isOpen={openPDsResolver} toggle={togglePDsResolver} scrollable>
	<ModalHeader toggle={togglePDsResolver}>PDS Resolver</ModalHeader>
	<ModalBody>
		<p style="min-height: 1500px;">
			{#if theError}
				<div>{theError}</div>
			{:else}
				<div class="fs-4 text-center">{theRole}</div>
				<div class="mb-2 text-center">resolved to</div>
				{#each thePeople as person}
					<div class="text-center">{person.cn} ({person.uid})</div>
				{/each}
			{/if}
		</p>
	</ModalBody>
	<ModalFooter>
		<Button on:click={togglePDsResolver}>Close</Button>
	</ModalFooter>
</Modal>
