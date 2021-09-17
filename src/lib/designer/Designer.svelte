<svelte:options accessors={true} />

<script lang="ts">
	import { session } from '$app/stores';
	import KFK from '$lib/designer/KFK';
	import { onMount } from 'svelte';
	import { ListGroup, ListGroupItem } from 'sveltestrap';
	export let template: Template;
	export let theKFK;

	let description: string;
	let jqueryui: any;
	let that = this;
	onMount(async () => {
		description = 'This is my template';
		const module = await import('jquery-ui-dist/jquery-ui');
		jqueryui = module.default;
		console.log('onMounting....', $session);
		KFK.init(template, $session.user);
		theKFK = KFK;
	});
	let currentMode = KFK.mode;
	function setMode(what: string, event: any) {
		KFK.setMode(what, event);
		currentMode = KFK.mode;
	}
	export function sayHello() {
		console.log('Hello, I am Designer');
	}
</script>

<div id="S1">
	<div id="C1">
		<div id="C9" />
		<div id="containerbkg" class="grid1" />
		<div
			id="C3"
			on:focus={() => KFK.C3GotFocus()}
			on:blur={() => KFK.C3Blur()}
			on:mouseover={() => KFK.focusOnC3()}
		/>
		<div id="selectingrect" class="selectingrect" />
	</div>
</div>
<div id="leftPanel" class="bg-white padlayout spaceToHide">
	<ListGroup>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'POINTER' ? 'active' : ''}"
			on:click={(event) => setMode('POINTER', event)}
			title="点选"
		>
			<img src="/svg/POINTER.svg" alt="" class="cocotool" />
			<div class="shortcutkey">ESC</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'ACTION' ? 'active' : ''}"
			on:click={(event) => setMode('ACTION', event)}
			title="活动"
		>
			<img src="/svg/ACTION.svg" alt="" class="cocotool" />
			<div class="shortcutkey">1</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'INFORM' ? 'active' : ''}"
			on:click={(event) => setMode('INFORM', event)}
			title="通知"
		>
			<img src="/svg/INFORM.svg" alt="" class="cocotool" />
			<div class="shortcutkey">2</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'SCRIPT' ? 'active' : ''}"
			on:click={(event) => setMode('SCRIPT', event)}
			title="程序"
		>
			<img src="/svg/SCRIPT.svg" alt="" class="cocotool" />
			<div class="shortcutkey">3</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'TIMER' ? 'active' : ''}"
			on:click={(event) => setMode('TIMER', event)}
			title="定时器"
		>
			<img src="/svg/TIMER.svg" alt="" class="cocotool" />
			<div class="shortcutkey">3</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'SUB' ? 'active' : ''}"
			on:click={(event) => setMode('SUB', event)}
			title="子流程"
		>
			<img src="/svg/SUB.svg" alt="" class="cocotool" />
			<div class="shortcutkey">3</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'AND' ? 'active' : ''}"
			on:click={(event) => setMode('AND', event)}
			title="并"
		>
			<img src="/svg/AND.svg" alt="" class="cocotool" />
			<div class="shortcutkey">3</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'OR' ? 'active' : ''}"
			on:click={(event) => setMode('OR', event)}
			title="或"
		>
			<img src="/svg/OR.svg" alt="" class="cocotool" />
			<div class="shortcutkey">3</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'CONNECT' ? 'active' : ''}"
			on:click={(event) => setMode('CONNECT', event)}
			title="连接"
		>
			<img src="/svg/connect.svg" alt="" class="cocotool" id="tool_connect" />
			<div class="shortcutkey">J</div>
		</ListGroupItem>
	</ListGroup>
</div>
<div
	id="rightPanel"
	class="bg-white padlayout spaceToHide"
	on:click|preventDefault|stopPropagation={() => KFK.clickOnRightPanel()}
>
	<div id="prop_START" class="prop_form nodisplay">
		<div class="view prop_section">
			<container class="text-center">
				<row class="m5 node_title"> Template </row>
			</container>
		</div>
		<div class="edit prop_section flex">
			<container class="text-center">
				<row class="m5 node_title text-center"> Template </row>
			</container>
		</div>
	</div>
	<icon
		icon="plus"
		rotate="45"
		id="close_button"
		font-scale="1.5"
		on:click={() => KFK.closeProperties()}
	/>
</div>
<div id="minimap" class="padlayout spaceToHide" />
