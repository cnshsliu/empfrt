<script lang="ts">
	import * as api from '$lib/api';
	import { _ } from '$lib/i18n';
	import { qtb } from '$lib/utils';
	import {
		InputGroup,
		InputGroupText,
		Input,
		ModalHeader,
		ModalBody,
		Modal,
		ModalFooter,
		Button
	} from 'sveltestrap';
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
	 * 	export asyncresolve() Resolve PDS
	 *
	 * @param {...} 	export asyncrds -
	 * @param {...} teamid - use this teamid if wfid is absent
	 * @param {...} email - use this email if wfid is absent
	 * @param {...} wfid - optinnal, use wf.teamid and wf.starter if presents
	 *
	 * @return {...}
	 */
	export async function resolve() {
		value = qtb(value);
		if (!value || value.trim().length === 0) {
			console.warn('Resolver: no pds specified');
			return;
		}
		let res = await api.post('explain/pds', { pds: value }, $session.user.sessionToken);
		if (res.error) {
			showError(res.error, res.message);
		} else {
			showPeople(value, res);
		}
	}

	export let label = $_('prop.action.kvar.visi');
	export let value = '';
	export let readonly = false;
	export let btnText = $_('button.resolve');
	export let embed = false;
	let className = '';
	const inputing = (node) => {
		const handleKey = (event) => {
			/*
			if (event.target.value) {
				event.target.classList.add('filled');
			} else {
				event.target.classList.remove('filled');
			}
				*/
			event.key === 'Enter' && resolve();
		};
		node.addEventListener('keyup', handleKey);

		return {
			destroy() {
				node.removeEventListener('keyup', handleKey);
			}
		};
	};

	export { className as class };
</script>

<InputGroup size="sm" class={className}>
	<InputGroupText>
		{label}
	</InputGroupText>
	<input class="form-control" bind:value disabled={readonly} use:inputing />
	{#if value && value.trim().length > 0}
		<Button
			on:click={async (e) => {
				e.preventDefault();
				resolve();
			}}
		>
			{btnText}
		</Button>
	{/if}
</InputGroup>

{#if embed === false}
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
{:else if theError}
	<div>{theError}</div>
{:else if Array.isArray(thePeople) && thePeople.length > 0 && thePeople[0].uid !== '' && value.trim().length > 0}
	{#each thePeople as person}
		<div class="text-center">{person.cn} ({person.uid})</div>
	{/each}
{/if}
