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
		Button,
		Icon
	} from 'sveltestrap';
	import { session } from '$app/stores';
	import { filterStorage } from '$lib/empstores';
	let user = $session.user;
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
		let payload: any = { pds: value };
		if (try_with_email) {
			payload.email = try_with_email;
			$filterStorage.try_with_email = try_with_email;
		}
		if (try_with_email !== user.email || try_with_teamid || try_with_kvar || try_with_wfid) {
			showExtra = true;
			if (try_with_teamid) {
				payload.teamid = try_with_teamid;
				$filterStorage.try_with_teamid = try_with_teamid;
			}
			if (try_with_kvar) {
				payload.kvar = try_with_kvar;
				$filterStorage.try_with_kvar = try_with_kvar;
			}
			if (try_with_wfid) {
				payload.wfid = try_with_wfid;
				$filterStorage.try_with_wfid = try_with_wfid;
			}
		}
		let res = await api.post('explain/pds', payload, user.sessionToken);
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

	let showExtra = false;
	export { className as class };
	let try_with_teamid = $filterStorage.try_with_teamid;
	let try_with_email = $filterStorage.try_with_email ? $filterStorage.try_with_email : user.email;
	let try_with_kvar = $filterStorage.try_with_kvar ? $filterStorage.try_with_kvar : '';
	let try_with_wfid = $filterStorage.try_with_wfid ? $filterStorage.try_with_wfid : '';

	const getExtraFromSession = function () {
		try_with_teamid = $filterStorage.try_with_teamid;
		try_with_email = $filterStorage.try_with_email ? $filterStorage.try_with_email : user.email;
		try_with_kvar = $filterStorage.try_with_kvar ? $filterStorage.try_with_kvar : '';
		try_with_wfid = $filterStorage.try_with_wfid ? $filterStorage.try_with_wfid : '';
	};
	const noExtra = function () {
		try_with_teamid = '';
		try_with_email = user.email;
		try_with_kvar = '';
		try_with_wfid = '';
	};
</script>

<InputGroup size="sm" class={className}>
	<InputGroupText>
		{label}
	</InputGroupText>
	<input class="form-control" bind:value disabled={readonly} use:inputing />
	<Button
		on:click={() => {
			showExtra = !showExtra;
			if (showExtra) {
				getExtraFromSession();
			} else {
				noExtra();
			}
		}}
	>
		{showExtra ? $_('pds.noextra') : $_('pds.withextra')}
	</Button>
	<Button
		color="primary"
		on:click={async (e) => {
			e.preventDefault();
			resolve();
		}}
	>
		{btnText}
	</Button>
</InputGroup>
{#if showExtra}
	<div class="mt-3 fs-5">
		{$_('prop.action.p10t.try')}
	</div>
	<InputGroup>
		<InputGroupText>
			{$_('prop.action.p10t.tryuser')}
		</InputGroupText>
		<Input placeholder="user full email" type="text" bind:value={try_with_email} />
		<Button
			on:click={(e) => {
				e.preventDefault();
				try_with_email = user.email;
				$filterStorage.try_with_email = user.email;
			}}
		>
			<Icon name="x-lg" />
		</Button>
	</InputGroup>
	<InputGroup>
		<InputGroupText>
			{$_('prop.action.p10t.trykvar')}
		</InputGroupText>
		<Input placeholder="var=value;var=value..." type="text" bind:value={try_with_kvar} />
		<Button
			on:click={(e) => {
				e.preventDefault();
				try_with_kvar = '';
				$filterStorage.try_with_kvar = '';
			}}
		>
			<Icon name="x-lg" />
		</Button>
	</InputGroup>
	<InputGroup>
		<InputGroupText>
			{$_('prop.action.p10t.tryteam')}
		</InputGroupText>
		<Input placeholder="team id" type="text" bind:value={try_with_teamid} />
		<Button
			on:click={(e) => {
				e.preventDefault();
				try_with_teamid = '';
				$filterStorage.try_with_teamid = '';
			}}
		>
			<Icon name="x-lg" />
		</Button>
	</InputGroup>
	<InputGroup>
		<InputGroupText>
			{$_('prop.action.p10t.trywfid')}
		</InputGroupText>
		<Input placeholder="workflow id" type="text" bind:value={try_with_wfid} />
		<Button
			on:click={(e) => {
				e.preventDefault();
				try_with_wfid = '';
				$filterStorage.try_with_wfid = '';
			}}
		>
			<Icon name="x-lg" />
		</Button>
	</InputGroup>
{/if}

{#if embed === false}
	<Modal isOpen={openPDsResolver} toggle={togglePDsResolver} scrollable>
		<ModalHeader toggle={togglePDsResolver}>{$_('pds.resolver')}</ModalHeader>
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
			<Button on:click={togglePDsResolver}>{$_('button.close')}</Button>
		</ModalFooter>
	</Modal>
{:else if theError}
	<div>{theError}</div>
{:else if Array.isArray(thePeople) && thePeople.length > 0 && thePeople[0].uid !== '' && value.trim().length > 0}
	{#each thePeople as person}
		<div class="text-center">{person.cn} ({person.uid})</div>
	{/each}
{:else if thePeople.length == 0}
	<div class="text-center">NOT FOUND</div>
{/if}
