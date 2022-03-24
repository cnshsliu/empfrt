<script lang="ts">
	import { Input, Button, InputGroup, InputGroupText } from 'sveltestrap';
	export let jq;
	export let idForInput;
	export let KFK;
	export let readonly;
	let oldId = idForInput;
	let errmsg = 'You may need to give it a meaningful unique ID';
	let enableButton = false;
</script>

<span class="fs-6">Current ID: </span><span class="fs-5">{oldId} </span>
{#if !readonly}
	<InputGroup>
		<InputGroupText>Change ID to</InputGroupText>
		<Input
			bind:value={idForInput}
			on:input={(e) => {
				e.preventDefault();
				let inputValue = e.target.value;
				console.log(inputValue);
				inputValue = inputValue.trim();
				if (inputValue.length < 4) {
					errmsg = 'id is too short';
					enableButton = false;
					return;
				} else {
					errmsg = '';
					enableButton = true;
				}
				if (inputValue === oldId) {
					enableButton = false;
				} else {
					if (jq(`#${inputValue}`).length > 0) {
						errmsg = `${inputValue} already exists`;
						enableButton = false;
					}
				}
			}}
		/>
		<Button
			color={'primary'}
			disabled={!enableButton}
			on:click={async (e) => {
				e.preventDefault();
				idForInput = idForInput.trim();
				if (idForInput === oldId) {
				} else {
					if (idForInput !== oldId && jq('#' + idForInput).length > 0) {
						errmsg = `${idForInput} already exists`;
					} else {
						KFK.changeId(oldId, idForInput);
						oldId = idForInput;
						errmsg = '';
					}
				}
			}}
		>
			Set Id
		</Button>
	</InputGroup>
	<InputGroup class="mb-3">
		<span class="fs-6 primary"> {errmsg} </span>
	</InputGroup>
{/if}
