<script lang="ts">
	import { Input, Button, InputGroup, InputGroupText } from 'sveltestrap';
	import { _ } from '$lib/i18n';
	import * as utils from '$lib/utils';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let jq;
	export let idForInput;
	export let KFK;
	export let readonly;
	let oldId = idForInput;
	let errmsg = $_('changeid.meaningful');
	let enableButton = false;

	const onInput = function (e) {
		e.preventDefault();
		let inputValue = e.target.value;
		inputValue = inputValue.trim();
		e.target.value = inputValue;
		if (inputValue.length < 4) {
			errmsg = $_('changeid.tooshort');
			enableButton = false;
			return;
		} else {
			errmsg = utils.formatId(inputValue);
			if (errmsg === '') {
				enableButton = true;
			} else {
				errmsg = $_('changeid.idformat');
				enableButton = false;
			}
		}
		if (inputValue === oldId) {
			enableButton = false;
		} else {
			if (jq(`#${inputValue}`).length > 0) {
				errmsg = `${inputValue} ${$_('changeid.exist')}`;
				enableButton = false;
			}
		}
		if (enableButton) {
			dispatch('changeNodeId', { oldid: oldId, newid: inputValue });
		}
	};
</script>

<span class="fs-6">{$_('changeid.current')}</span>
<span class="fs-5">{oldId}</span>
{#if !readonly}
	<InputGroup>
		<InputGroupText>{$_('changeid.changeto')}</InputGroupText>
		<Input bind:value={idForInput} on:input={onInput} />
		<!--Button
			color={'primary'}
			disabled={!enableButton}
			on:click={async (e) => {
				e.preventDefault();
				idForInput = idForInput.trim();
				if (idForInput.length < 4) {
					errmsg = $_('changeid.tooshort');
				} else {
					errmsg = utils.formatId(idForInput);
					if (errmsg !== '') {
						errmsg = $_('changeid.idformat');
					} else {
						if (idForInput !== oldId) {
							if (jq('#' + idForInput).length > 0) {
								errmsg = `${idForInput} ${$_('changeid.exist')}`;
							} else {
								KFK.changeId(oldId, idForInput);
								oldId = idForInput;
								errmsg = '';
							}
						}
					}
				}
			}}>
			{$_('changeid.set')}
		</Button -->
	</InputGroup>
	<InputGroup class="mb-3">
		<span class="fs-6 primary">{errmsg}</span>
	</InputGroup>
{/if}
