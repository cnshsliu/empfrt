<svelte:options accessors={true} />

<script lang="ts">
	import jQuery from 'jquery';
	import { session } from '$app/stores';
	import KFK from '$lib/designer/KFK';
	import { onMount, onDestroy } from 'svelte';
	import { ListGroup, ListGroupItem } from 'sveltestrap';
	export let template: Template;
	export let tpl_mode: string;
	export let theKFK: KFKclass;
	const jq = jQuery;

	let jqueryui: any;
	let that = this;
	let currentMode = KFK.mode;
	function designerSetMode(what: string, event: any) {
		KFK.setMode(what, event);
		currentMode = KFK.mode;
	}

	export function designerCallback_for_KFK(cmd: string, args: any): void {
		switch (cmd) {
			case 'setMode':
				currentMode = args;
		}
	}

	onMount(async () => {
		const module = await import('jquery-ui-dist/jquery-ui');
		jqueryui = module.default;
		console.log('onMounting....', $session);
		KFK.designerCallback = designerCallback_for_KFK;
		KFK.init($session.user);
		await KFK.loadDoc(template, tpl_mode);
		theKFK = KFK;
	});
	onDestroy(async () => {
		jq(document).off();
		console.log('document event closed');
	});
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
<div id="leftPanel" class="bg-white padlayout spaceToHide noshow">
	<ListGroup>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'POINTER' ? 'active' : ''}"
			on:click={(event) => designerSetMode('POINTER', event)}
			title="点选"
		>
			<img src="/svg/POINTER.svg" alt="" class="cocotool" />
			<div class="shortcutkey">ESC</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'ACTION' ? 'active' : ''}"
			on:click={(event) => designerSetMode('ACTION', event)}
			title="活动"
		>
			<img src="/svg/ACTION.svg" alt="" class="cocotool" />
			<div class="shortcutkey">1</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'INFORM' ? 'active' : ''}"
			on:click={(event) => designerSetMode('INFORM', event)}
			title="通知"
		>
			<img src="/svg/INFORM.svg" alt="" class="cocotool" />
			<div class="shortcutkey">2</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'SCRIPT' ? 'active' : ''}"
			on:click={(event) => designerSetMode('SCRIPT', event)}
			title="程序"
		>
			<img src="/svg/SCRIPT.svg" alt="" class="cocotool" />
			<div class="shortcutkey">3</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'TIMER' ? 'active' : ''}"
			on:click={(event) => designerSetMode('TIMER', event)}
			title="定时器"
		>
			<img src="/svg/TIMER.svg" alt="" class="cocotool" />
			<div class="shortcutkey">4</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'SUB' ? 'active' : ''}"
			on:click={(event) => designerSetMode('SUB', event)}
			title="子流程"
		>
			<img src="/svg/SUB.svg" alt="" class="cocotool" />
			<div class="shortcutkey">5</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'AND' ? 'active' : ''}"
			on:click={(event) => designerSetMode('AND', event)}
			title="并"
		>
			<img src="/svg/AND.svg" alt="" class="cocotool" />
			<div class="shortcutkey">6</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'OR' ? 'active' : ''}"
			on:click={(event) => designerSetMode('OR', event)}
			title="或"
		>
			<img src="/svg/OR.svg" alt="" class="cocotool" />
			<div class="shortcutkey">7</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'CONNECT' ? 'active' : ''}"
			on:click={(event) => designerSetMode('CONNECT', event)}
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
<!--div id="minimap" class="padlayout spaceToHide" /-->
