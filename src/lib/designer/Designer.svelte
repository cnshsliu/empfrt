<svelte:options accessors={true} />

<script lang="ts">
	import jQuery from 'jquery';
	import Parser from '$lib/parser';
	import { session } from '$app/stores';
	import type { Template, Workflow } from '$lib/types';
	import And from '$lib/designer/prop/And.svelte';
	import Action from '$lib/designer/prop/Action.svelte';
	import Script from '$lib/designer/prop/Script.svelte';
	import Inform from '$lib/designer/prop/Inform.svelte';
	import Timer from '$lib/designer/prop/Timer.svelte';
	import Sub from '$lib/designer/prop/Sub.svelte';
	import KFK from '$lib/designer/KFK';
	import { onMount, onDestroy } from 'svelte';
	import {
		Button,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader,
		ListGroup,
		ListGroupItem
	} from 'sveltestrap';
	export let template: Template;
	export let workflow: Workflow;
	export let tpl_mode: string;
	export let theKFK: KFKclass;
	const jq = jQuery;

	let jqueryui: any;
	let that = this;
	let currentMode = KFK.mode;
	let kvarsArr;
	let roleOptions = [];
	let nodeInfo = {
		nodeType: '',
		jqDiv: null,
		nodeProps: { kvarsArr: [], label: '' }
	};
	function designerSetMode(what: string, event: any) {
		KFK.setMode(what, event);
		currentMode = KFK.mode;
	}

	export let openModal = false;
	const toggle = () => {
		KFK.panStartAt = undefined;
		openModal = !openModal;
		if (openModal === false) {
			KFK.showingProp = false;
			console.log('closing...');
			documentEventOn();
		}
	};
	const setNodeProperties = () => {
		toggle();
		console.log('setto ', nodeInfo.nodeProps);
		if (nodeInfo.nodeType === 'ACTION') {
			nodeInfo.nodeProps.kvarsArr = kvarsArr;
		}
		theKFK.setNodeProperties(nodeInfo.jqDiv, nodeInfo.nodeProps);
	};
	export function designerCallback(cmd: string, args: any): void {
		switch (cmd) {
			case 'setMode':
				currentMode = args;
				break;
			case 'showProp':
				nodeInfo = args;
				let nodeType = args.nodeType;
				if (nodeType === 'ACTION') {
					//ACTION 是需要有role和kvars的
					roleOptions = Parser.collectRoles(args.nodes);
					if (nodeInfo.nodeProps.ACTION.kvars) {
						kvarsArr = Parser.kvarsToArray(JSON.parse(nodeInfo.nodeProps.ACTION.kvars));
					}
				} else if (nodeType === 'INFORM') {
					roleOptions = Parser.collectRoles(args.nodes);
				}
				console.log('opening...', args);
				documentEventOff();
				openModal = true;
				break;
		}
	}

	onMount(async () => {
		const module = await import('jquery-ui-dist/jquery-ui');
		jqueryui = module.default;
		console.log('onMounting....', $session);
		KFK.designerCallback = designerCallback;
		KFK.init($session.user);
		//console.log(workflow);
		//console.log(template);
		KFK.scenario = workflow ? 'workflow' : 'template';
		if (KFK.scenario === 'template') {
			await KFK.loadTemplateDoc(template, tpl_mode);
		} else {
			await KFK.loadWorkflowDoc(workflow);
		}
		theKFK = KFK;
		theKFK.addDocumentEventHandler(true);
	});

	function documentEventOff() {
		jq(document).off();
	}
	function documentEventOn() {
		theKFK.addDocumentEventHandler(true);
	}
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
		<div id="C3" on:focus={() => KFK.C3GotFocus()} on:blur={() => KFK.C3Blur()} />
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
			class="d-flex align-items-center toolbox {currentMode === 'GROUND' ? 'active' : ''}"
			on:click={(event) => designerSetMode('GROUND', event)}
			title="接地"
		>
			<img src="/svg/GROUND.svg" alt="" class="cocotool" />
			<div class="shortcutkey">8</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentMode === 'CONNECT' ? 'active' : ''}"
			on:click={(event) => designerSetMode('CONNECT', event)}
			title="连接"
		>
			<img src="/svg/connect.svg" alt="" class="cocotool" id="tool_connect" />
			<div class="shortcutkey">9</div>
		</ListGroupItem>
	</ListGroup>
</div>
<!-- div id="minimap" class="padlayout spaceToHide" / -->
<Modal isOpen={openModal} {toggle}>
	<ModalHeader {toggle}>{nodeInfo.nodeProps.label}</ModalHeader>
	<ModalBody>
		{#if nodeInfo.nodeType === 'AND'}
			<And {nodeInfo} />
		{:else if nodeInfo.nodeType === 'ACTION'}
			<Action {nodeInfo} {kvarsArr} {roleOptions} />
		{:else if nodeInfo.nodeType === 'SCRIPT'}
			<Script {nodeInfo} />
		{:else if nodeInfo.nodeType === 'INFORM'}
			<Inform {nodeInfo} {roleOptions} />
		{:else if nodeInfo.nodeType === 'TIMER'}
			<Timer {nodeInfo} />
		{:else if nodeInfo.nodeType === 'SUB'}
			<Sub {nodeInfo} />
		{/if}
	</ModalBody>
	<ModalFooter>
		<Button color="primary" on:click={setNodeProperties}>Set</Button>
		<Button color="secondary" on:click={toggle}>Cancel</Button>
	</ModalFooter>
</Modal>
