<svelte:options accessors={true} />

<script lang="ts">
	import Parser from '$lib/parser';
	import { Status } from '$lib/status';
	import * as api from '$lib/api';
	import { session } from '$app/stores';
	import type { Template, Workflow, KFKclass } from '$lib/types';
	import Action from '$lib/designer/prop/Action.svelte';
	import ScriptProp from '$lib/designer/prop/ScriptProp.svelte';
	import Inform from '$lib/designer/prop/Inform.svelte';
	import Timer from '$lib/designer/prop/Timer.svelte';
	import Sub from '$lib/designer/prop/Sub.svelte';
	import Connect from '$lib/designer/prop/Connect.svelte';
	import PropertyHelp from '$lib/designer/prop/PropertyHelp.svelte';
	import KFK from '$lib/designer/KFK';
	import { onMount, onDestroy } from 'svelte';
	import {
		Container,
		Row,
		Col,
		Button,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader,
		ListGroup,
		ListGroupItem,
		Icon
	} from 'sveltestrap';
	import type { KvarInput, NodeInfo } from '$lib/types';

	export let template: Template;
	export let workflow: Workflow;
	export let tpl_mode: string;

	let jQuery: any;
	let jq: any;
	let jqueryui: any;
	let that = this;
	let currentTool = 'POINTER';
	let kvarsArr: KvarInput[];
	let errMsg = '';
	let roleOptions = [];

	let nodeInfo: NodeInfo;
	function designerSetTool(what: string, event?: any) {
		KFK.setTool(what, event);
		currentTool = KFK.tool;
	}

	export let openModal = false;
	export let modalSize = undefined;
	let helpId = undefined;
	const toggle = () => {
		KFK.panStartAt = undefined;
		openModal = !openModal;
		if (openModal === false) {
			KFK.showingProp = false;
			console.log('closing...');
			documentEventOn();
		}
	};
	const setNodeOrConnectProperties = async () => {
		if (nodeInfo.nodeType === 'CONNECT') await setConnectProperties();
		else await setNodeProperties();
	};
	const setConnectProperties = async () => {
		toggle();
		await KFK.setConnectProperties(nodeInfo.theConnect, nodeInfo.caseValue);
	};

	const setNodeProperties = async () => {
		if (nodeInfo.nodeType === 'ACTION') {
			nodeInfo.nodeProps.kvarsArr = kvarsArr;
		}
		if (nodeInfo.nodeType === 'SUB') {
			let templates = await api.post(
				'template/search',
				{ tplid: nodeInfo.nodeProps.SUB.sub, fields: { _id: 0, doc: 0 } },
				$session.user.sessionToken
			);
			if (templates.length === 0) {
				errMsg = `${nodeInfo.nodeProps.SUB.sub} does not exist`;
				return;
			} else {
				errMsg = '';
			}
		}
		toggle();
		KFK.setNodeProperties(nodeInfo.jqDiv, nodeInfo.nodeProps);
	};
	export function designerCallback(cmd: string, args: any): void {
		switch (cmd) {
			case 'setTemplate':
				template = args;
			case 'setTool':
				currentTool = args;
				break;
			case 'showNodeProp':
				modalSize = undefined;
				helpId = undefined;
				nodeInfo = args;
				if (nodeInfo.nodeType === 'ACTION') {
					//ACTION 是需要有role和kvars的
					roleOptions = Parser.collectRoles(args.nodes);
					if (nodeInfo.nodeProps.ACTION.kvars) {
						let kvarsString = nodeInfo.nodeProps.ACTION.kvars;
						try {
							kvarsArr = Parser.kvarsToArray(JSON.parse(kvarsString));
						} catch (e) {
							console.log(kvarsString);
							kvarsString = kvarsString.replace('}{', ',');
							console.log(kvarsString);
							kvarsArr = Parser.kvarsToArray(JSON.parse(kvarsString));
						}
					}
				} else if (nodeInfo.nodeType === 'INFORM') {
					roleOptions = Parser.collectRoles(args.nodes);
				}
				console.log('opening...', args);
				documentEventOff();
				openModal = true;
				break;
			case 'showConnectProp':
				modalSize = undefined;
				helpId = undefined;
				nodeInfo = args;
				console.log('opening...', args);
				documentEventOff();
				openModal = true;
				break;
		}
	}

	onMount(async () => {
		const jqModule = await import('jquery');
		jQuery = jqModule.default;
		jq = jQuery;
		/* The next several lines of codes make draggalbe/resizeable availabe for jQuery */
		/* jquery-ui-1.13.0.custom is customized on website https://jqueryui.com/download/ */
		const module = await import('$lib/../../thirdparty/jquery-ui-1.13.0.custom/jquery-ui.min.js');
		jqueryui = module.default;
		/* jquery-ui import finished */
		KFK.designerCallback = designerCallback;
		KFK.init($session.user);
		//console.log(workflow);
		//console.log(template);
		KFK.scenario = workflow ? 'workflow' : 'template';
		if (KFK.scenario === 'template') {
			if (tpl_mode !== 'edit') {
				designerSetTool('POINTER');
			}
			await KFK.loadTemplateDoc(template, tpl_mode);
		} else {
			designerSetTool('POINTER');
			await KFK.loadWorkflowDoc(workflow);
		}
		KFK.addDocumentEventHandler(true);
		currentTool = KFK.tool;
	});

	export async function changeViewMode(tpl_mode: string) {
		await KFK.loadTemplateDoc(template, tpl_mode);
	}
	export async function loadTemplate(tpl: Template, tpl_mode: string) {
		template = tpl;
		console.log('loadTemplate ', tpl_mode);
		await KFK.loadTemplateDoc(template, tpl_mode);
	}

	export function documentEventOff() {
		jq(document).off();
	}
	export function documentEventOn() {
		KFK.addDocumentEventHandler(true);
	}
	onDestroy(async () => {
		jq(document).off();
		console.log('document event closed');
	});
	export function sayHello() {
		console.log('Hello, I am Designer');
	}
	const showDesignerHelp = function () {
		return;
	};

	const showHelp = function (hid) {
		if (hid) {
			helpId = hid.toUpperCase();
		} else {
			helpId = 'NONE';
		}

		modalSize = hid ? 'xl' : undefined;
	};

	$: readonly = tpl_mode !== 'edit';
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
	<ListGroup class="mt-3">
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentTool === 'POINTER' ? 'active' : ''}"
			on:click={(event) => designerSetTool('POINTER', event)}
			title="点选"
		>
			<img src="/svg/POINTER.svg" alt="" class="cocotool" />
			<div class="shortcutkey">ESC</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentTool === 'ACTION' ? 'active' : ''}"
			on:click={(event) => designerSetTool('ACTION', event)}
			title="活动"
		>
			<img src="/svg/ACTION.svg" alt="" class="cocotool" />
			<div class="shortcutkey">1</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentTool === 'INFORM' ? 'active' : ''}"
			on:click={(event) => designerSetTool('INFORM', event)}
			title="通知"
		>
			<img src="/svg/INFORM.svg" alt="" class="cocotool" />
			<div class="shortcutkey">2</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentTool === 'SCRIPT' ? 'active' : ''}"
			on:click={(event) => designerSetTool('SCRIPT', event)}
			title="程序"
		>
			<img src="/svg/SCRIPT.svg" alt="" class="cocotool" />
			<div class="shortcutkey">3</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentTool === 'TIMER' ? 'active' : ''}"
			on:click={(event) => designerSetTool('TIMER', event)}
			title="定时器"
		>
			<img src="/svg/TIMER.svg" alt="" class="cocotool" />
			<div class="shortcutkey">4</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentTool === 'SUB' ? 'active' : ''}"
			on:click={(event) => designerSetTool('SUB', event)}
			title="子流程"
		>
			<img src="/svg/SUB.svg" alt="" class="cocotool" />
			<div class="shortcutkey">5</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentTool === 'AND' ? 'active' : ''}"
			on:click={(event) => designerSetTool('AND', event)}
			title="并"
		>
			<img src="/svg/AND.svg" alt="" class="cocotool" />
			<div class="shortcutkey">6</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentTool === 'OR' ? 'active' : ''}"
			on:click={(event) => designerSetTool('OR', event)}
			title="或"
		>
			<img src="/svg/OR.svg" alt="" class="cocotool" />
			<div class="shortcutkey">7</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentTool === 'GROUND' ? 'active' : ''}"
			on:click={(event) => designerSetTool('GROUND', event)}
			title="接地"
		>
			<img src="/svg/GROUND.svg" alt="" class="cocotool" />
			<div class="shortcutkey">8</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox {currentTool === 'CONNECT' ? 'active' : ''}"
			on:click={(event) => designerSetTool('CONNECT', event)}
			title="连接"
		>
			<img src="/svg/CONNECT.svg" alt="" class="cocotool" id="tool_connect" />
			<div class="shortcutkey">9</div>
		</ListGroupItem>
	</ListGroup>
</div>
<!-- div id="minimap" class="padlayout spaceToHide" / -->
{#if workflow}
	<div class="kfk-workflow-info">
		<span class="kfk-wf-info-value">{workflow.wftitle}</span>
		<span class="kfk-wf-info-title">/</span>
		<span class="kfk-wf-info-value">{Status[workflow.status]}</span>
		<span class="kfk-wf-info-title">/</span>
		<span class="kfk-wf-info-value">{workflow.starter}</span>
	</div>
{:else}
	<div id="templatehelp" class="kfk-workflow-info">Help</div>
{/if}
<Modal isOpen={openModal} {toggle} size={modalSize}>
	<ModalHeader {toggle}>{nodeInfo.nodeProps.label}</ModalHeader>
	<ModalBody>
		<Container>
			<Row>
				<Col>
					{#if nodeInfo.nodeType === 'ACTION'}
						<Action {nodeInfo} bind:kvarsArr {roleOptions} {showHelp} {readonly} />
					{:else if nodeInfo.nodeType === 'INFORM'}
						<Inform {nodeInfo} {roleOptions} {showHelp} {readonly} />
					{:else if nodeInfo.nodeType === 'SCRIPT'}
						<ScriptProp {nodeInfo} {showHelp} {readonly} />
					{:else if nodeInfo.nodeType === 'TIMER'}
						<Timer {nodeInfo} {showHelp} {readonly} />
					{:else if nodeInfo.nodeType === 'SUB'}
						<Sub {nodeInfo} {errMsg} {showHelp} {readonly} />
					{:else if nodeInfo.nodeType === 'CONNECT'}
						<Connect {nodeInfo} {showHelp} {readonly} />
					{/if}
				</Col>
				<PropertyHelp {helpId} />
			</Row>
		</Container>
	</ModalBody>
	<ModalFooter>
		{#if !readonly}
			<Button color="primary" on:click={setNodeOrConnectProperties}>Set</Button>
			<Button color="secondary" on:click={toggle}>Cancel</Button>
		{:else}
			<Button color="primary" on:click={toggle}>Okay</Button>
		{/if}
	</ModalFooter>
</Modal>
