<svelte:options accessors />

<script lang="ts">
	import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap';
	import { _ } from '$lib/i18n';
	let open = false;
	export const toggle = () => (open = !open);
	export let title = 'Modal title';
	export let body =
		' Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ';
	export let buttons = ['Yes', 'No'];
	export let callbacks = [toggle, toggle];
</script>

<div>
	<Modal isOpen={open} {toggle}>
		<ModalHeader {toggle}>{title}</ModalHeader>
		<ModalBody>{body}</ModalBody>
		<ModalFooter>
			{#each buttons as btn, index}
				<Button
					color={'light'}
					class="btn-outline-primary m-0 py-1 px-3"
					on:click={async () => {
						callbacks[index]();
						open = false;
					}}>
					{btn}
				</Button>
			{/each}
			<Button color={'light'} class="btn-outline-primary m-3 py-1 px-3" on:click={toggle}>
				{$_('confirm.button.cancel')}
			</Button>
		</ModalFooter>
	</Modal>
</div>
