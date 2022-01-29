<svelte:options accessors={true} />

<script lang="ts">
	import { _ } from '$lib/i18n';
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
	import { getNotificationsContext } from 'svelte-notifications';
	const { addNotification } = getNotificationsContext();
	import type { oneArgFunc } from '$lib/types';
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
	export let workflow: Workflow = null;
	export let tpl_mode: string;

	let jQuery: any;
	let jq: any;
	let jqueryui: any;
	let that = this;
	let currentTool = 'POINTER';
	let kvarsArr: KvarInput[];
	let errMsg = '';
	let roleOptions = [];
	let workid = null;

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
			for (let i = 0; i < kvarsArr.length; i++) {
				if (kvarsArr[i].options) {
					let arr = kvarsArr[i].options.split(/[\s;,]/).filter((x) => x.length > 0);
					kvarsArr[i].options = arr.join(';');
				}
			}
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
				break;
			case 'setTool':
				currentTool = args;
				break;
			case 'showNodeProp':
				modalSize = 'xl';
				helpId = undefined;
				nodeInfo = args;
				if (nodeInfo.nodeType === 'ACTION') {
					workid = nodeInfo.jqDiv.find('.work').attr('id');
					//ACTION 是需要有role和kvars的
					roleOptions = Parser.collectRoles(args.nodes);
					if (nodeInfo.nodeProps.ACTION.kvars) {
						kvarsArr = Parser.kvarsToArray(
							nodeInfo.nodeProps.ACTION.kvars,
							''
						) as unknown as KvarInput[];
					}
				} else if (nodeInfo.nodeType === 'INFORM') {
					roleOptions = Parser.collectRoles(args.nodes);
				}
				documentEventOff();
				openModal = true;
				break;
			case 'showConnectProp':
				modalSize = undefined;
				helpId = undefined;
				nodeInfo = args;
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
	});

	const showDesignerHelp = function () {
		return;
	};
	export function setFadeMessage(
		message: string,
		type = 'warning',
		pos = 'bottom-right',
		time = 2000
	) {
		(addNotification as oneArgFunc)({
			text: message,
			position: pos,
			type: type,
			removeAfter: time
		});
	}

	const showHelp = function (hid) {
		if (hid) {
			helpId = hid.toUpperCase();
		} else {
			helpId = 'NONE';
		}

		modalSize = hid ? 'xl' : modalSize;
	};

	let tmp;
	$: readonly = tpl_mode !== 'edit';
	$: {
		tmp = currentTool;
	}

	let user = $session.user;
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
			class="d-flex align-items-center toolbox POINTER {currentTool === 'POINTER' ? 'active' : ''}"
			on:click={(event) => designerSetTool('POINTER', event)}
			title="点选"
		>
			<div class="shortcutkey">ESC</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox ACTION {currentTool === 'ACTION' ? 'active' : ''}"
			on:click={(event) => designerSetTool('ACTION', event)}
			title="活动"
		>
			<div class="shortcutkey">1</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox INFORM {currentTool === 'INFORM' ? 'active' : ''}"
			on:click={(event) => designerSetTool('INFORM', event)}
			title="通知"
		>
			<div class="shortcutkey">2</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox SCRIPT {currentTool === 'SCRIPT' ? 'active' : ''}"
			on:click={(event) => designerSetTool('SCRIPT', event)}
			title="程序"
		>
			<div class="shortcutkey">3</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox TIMER {currentTool === 'TIMER' ? 'active' : ''}"
			on:click={(event) => designerSetTool('TIMER', event)}
			title="定时器"
		>
			<div class="shortcutkey">4</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox SUB {currentTool === 'SUB' ? 'active' : ''}"
			on:click={(event) => designerSetTool('SUB', event)}
			title="子流程"
		>
			<div class="shortcutkey">5</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox AND {currentTool === 'AND' ? 'active' : ''}"
			on:click={(event) => designerSetTool('AND', event)}
			title="并"
		>
			<div class="shortcutkey">6</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox OR {currentTool === 'OR' ? 'active' : ''}"
			on:click={(event) => designerSetTool('OR', event)}
			title="或"
		>
			<div class="shortcutkey">7</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox GROUND {currentTool === 'GROUND' ? 'active' : ''}"
			on:click={(event) => designerSetTool('GROUND', event)}
			title="接地"
		>
			<div class="shortcutkey">8</div>
		</ListGroupItem>
		<ListGroupItem
			class="d-flex align-items-center toolbox CONNECT {currentTool === 'CONNECT' ? 'active' : ''}"
			on:click={(event) => designerSetTool('CONNECT', event)}
			title="连接"
		>
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
						<Action
							{nodeInfo}
							bind:kvarsArr
							{roleOptions}
							{showHelp}
							{readonly}
							bind:scenario={KFK.scenario}
							{workid}
						/>
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
			<Button color="primary" on:click={setNodeOrConnectProperties}>
				{$_('button.set')}
			</Button>
			<Button color="secondary" on:click={toggle}>
				{$_('button.cancel')}
			</Button>
		{:else}
			<Button color="primary" on:click={toggle}>
				{$_('button.okay')}
			</Button>
		{/if}
	</ModalFooter>
</Modal>
