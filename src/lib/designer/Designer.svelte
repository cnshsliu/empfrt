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
	import { Input } from 'sveltestrap';
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
	import type { KVarDefInput, NodeInfo } from '$lib/types';

	export let template: Template;
	export let workflow: Workflow = null;
	export let tpl_mode: string;
	export let routeStatus: any[] = [];

	let jQuery: any;
	let jq: any;
	let jqueryui: any;
	let that = this;
	let currentTool = 'POINTER';
	let kvarsArr: KVarDefInput[];
	let errMsg = '';
	let roleOptions = [];
	let workid = null;
	let checkTemplateUpdateInterval = null;
	let checkTemplateUpdateTimeout = null;
	let checkWorkflowUpdateInterval = null;
	let checkWorkflowUpdateTimeout = null;
	let checkTemplateTimes = 0;
	let checkWorkflowTimes = 0;
	let workflowUpdatedAt = '';
	let templateUpdatedAt = '';

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
		console.log('modal toggle');
		if (openModal === false) {
			KFK.showingProp = false;
			KFK.resetTmpTool();
			console.log('reset Tmp Tool');
			documentEventOn();
		}
	};
	const setNodeOrConnectProperties = async () => {
		if (nodeInfo.nodeType === 'CONNECT') await setConnectProperties();
		else await setNodeProperties();
	};
	const setConnectProperties = async () => {
		toggle();
		await KFK.setConnectProperties(nodeInfo.theConnect, nodeInfo.caseValue, nodeInfo.setValue);
	};

	const setNodeProperties = async () => {
		if (nodeInfo.nodeType === 'ACTION') {
			for (let i = 0; i < kvarsArr.length; i++) {
				kvarsArr[i].value = (kvarsArr[i].value as unknown as string).trim();
				//
				//START Speculate variable type
				//based on prefix_ of name
				/*
				let matchResult = kvarsArr[i].name.match(
					'(email|password|url|range|number|datetime|dt|date|time|color|search|select|textarea|file|radio|checkbox|cb|tbl)_'
				);
				kvarsArr[i].type = 'plaintext';
				if (matchResult) {
					kvarsArr[i].type = matchResult[1];
				} else {
					//based on value type if no prefix_ in name
					//eslint-disable-next-line
					matchResult = (typeof kvarsArr[i].value).match('(number|string)');
					if (matchResult) {
						kvarsArr[i].type = matchResult[1];
						if (kvarsArr[i].type === 'string') kvarsArr[i].type = 'plaintext';
					}
				}
					*/

				if (kvarsArr[i].options) {
					let arr = kvarsArr[i].options.split(/[\s;,]/).filter((x) => x.length > 0);
					kvarsArr[i].options = arr.join(';');
				}
				if ((kvarsArr[i].value as unknown as string).startsWith('=')) {
					kvarsArr[i].formula = kvarsArr[i].value as unknown as string;
					kvarsArr[i].formula = kvarsArr[i].formula.substring(1);
					kvarsArr[i].value = '';
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
		if (nodeInfo.nodeType !== 'TPL') {
			KFK.setNodeDOMProperties(nodeInfo.jqDiv, nodeInfo.nodeProps);
		} else {
			console.log('set template properties', template.pboat);
			await api.post(
				'template/set/pboat',
				{ tplid: template.tplid, pboat: template.pboat },
				user.sessionToken
			);
		}
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
						kvarsArr = Parser.kvarsToArrayForActionPropertyModal(
							nodeInfo.nodeProps.ACTION.kvars,
							''
						) as unknown as KVarDefInput[];
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
			case 'showTplProp':
				modalSize = undefined;
				helpId = undefined;
				nodeInfo = args;
				documentEventOff();
				openModal = true;
				break;
			case 'resetChecking':
				resetChecking();
				break;
			case 'updateCheckOnMousemove':
				updateCheckOnMousemove();
				break;
		}
	}

	const clearAllTimer = () => {
		if (checkTemplateUpdateInterval) {
			clearInterval(checkTemplateUpdateInterval);
			checkTemplateUpdateInterval = null;
		}
		if (checkTemplateUpdateTimeout) {
			clearTimeout(checkTemplateUpdateTimeout);
			checkTemplateUpdateTimeout = null;
		}
		if (checkWorkflowUpdateInterval) {
			clearInterval(checkWorkflowUpdateInterval);
			checkWorkflowUpdateInterval = null;
		}
		if (checkWorkflowUpdateTimeout) {
			clearTimeout(checkWorkflowUpdateTimeout);
			checkWorkflowUpdateTimeout = null;
		}
	};
	const clearTemplateTimer = () => {
		if (checkTemplateUpdateInterval) {
			clearInterval(checkTemplateUpdateInterval);
			checkTemplateUpdateInterval = null;
		}
		if (checkTemplateUpdateTimeout) {
			clearTimeout(checkTemplateUpdateTimeout);
			checkTemplateUpdateTimeout = null;
		}
	};

	const resetChecking = () => {
		clearAllTimer();
		if (KFK.scenario === 'template') {
			checkTemplateUpdateTimeout = setTimeout(async () => {
				await setTemplateCheckingInterval();
			}, 10000);
		}
		if (KFK.scenario === 'workflow') {
			checkWorkflowUpdateTimeout = setTimeout(async () => {
				await setWorkflowCheckingInterval();
			}, 5000);
		}
	};
	const remoteTemplateCheck = async () => {
		console.log(`${checkTemplateTimes} Checking template remote update ${templateUpdatedAt}`);
		checkTemplateTimes += 1;
		let ret = await api.post(
			'template/read',
			{ tplid: template.tplid, updatedAt: templateUpdatedAt },
			user.sessionToken
		);
		if (ret.hasOwnProperty('tplid')) {
			//console.log('Changed.... reload it');
			template = ret as unknown as Template;
			templateUpdatedAt = template.updatedAt;
			await KFK.loadTemplateDoc(template, tpl_mode);
		}
	};
	const updateCheckOnMousemove = () => {
		if (KFK.scenario === 'template') {
			if (tpl_mode === 'edit') {
				//鼠标移动时，应该是在编辑状态，就不能再刷新改动
				clearTemplateTimer();
				checkTemplateTimes = 0;
				console.log('editting mode, remote update after 10 seconds');
				checkTemplateUpdateTimeout = setTimeout(async () => {
					await setTemplateCheckingInterval();
				}, 10000);
			} else {
				if (checkTemplateUpdateInterval === null) {
					if (checkTemplateUpdateTimeout) {
						clearTimeout(checkTemplateUpdateTimeout);
					}
					checkTemplateUpdateTimeout = setTimeout(async () => {
						console.log('Restart monitoring');
						checkTemplateTimes = 0;
						await setTemplateCheckingInterval();
					}, 1000);
				}
			}
		}
		if (KFK.scenario === 'workflow') {
			if (checkWorkflowUpdateInterval === null) {
				if (checkWorkflowUpdateTimeout) {
					clearTimeout(checkWorkflowUpdateTimeout);
				}
				if (workflow.status === 'ST_RUN') {
					checkWorkflowUpdateTimeout = setTimeout(async () => {
						console.log('Restart monitoring');
						checkWorkflowTimes = 0;
						await setWorkflowCheckingInterval();
					}, 1000);
				}
			}
		}
	};
	const setTemplateCheckingInterval = async () => {
		if (KFK.scenario === 'template') {
			let intervalSeconds = 10;
			await remoteTemplateCheck();
			checkTemplateUpdateInterval = setInterval(async () => {
				await remoteTemplateCheck();
				if (checkTemplateTimes > (5 * 60) / intervalSeconds) {
					//if (checkTemplateTimes > 3) {
					console.log('Stop remote checking loop');
					clearInterval(checkTemplateUpdateInterval);
					checkTemplateUpdateInterval = null;
				}
			}, intervalSeconds * 1000);
		}
	};
	const setWorkflowCheckingInterval = async () => {
		let remoteCheck = async () => {
			console.log(`${checkWorkflowTimes} Checking monitoring update ${workflowUpdatedAt}`);
			checkWorkflowTimes += 1;
			let ret = await api.post(
				'workflow/check/status',
				{ wfid: workflow.wfid, updatedAt: workflowUpdatedAt },
				user.sessionToken
			);
			if (ret.hasOwnProperty('wfid')) {
				//console.log('Changed.... reset classes', ret);
				//workflowUpdatedAt = ret.updatedAt;
				await KFK.resetWorkflowStatusClasses(ret);
				if (ret.status != 'ST_RUN') {
					console.log('Not ST_RUN, stop monitoring...');
					clearInterval(checkWorkflowUpdateInterval);
					checkWorkflowUpdateInterval = null;
					checkWorkflowTimes = 0;
				}
			}
		};
		if (KFK.scenario === 'workflow' && workflow.status === 'ST_RUN') {
			let intervalSeconds = workflow.rehearsal ? 1 : 10; //seconds
			let stopEvery = 5; //minutes
			await remoteCheck();
			checkWorkflowUpdateInterval = setInterval(async () => {
				await remoteCheck();
				if (checkWorkflowTimes > (stopEvery * 60) / intervalSeconds) {
					//if (checkWorkflowTimes > 3) {
					console.log('stop process monitor update');
					clearInterval(checkWorkflowUpdateInterval);
					checkWorkflowUpdateInterval = null;
					checkWorkflowTimes = 0;
				}
			}, intervalSeconds * 1000);
		}
	};
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
			templateUpdatedAt = template.updatedAt;
		} else {
			designerSetTool('POINTER');
			await KFK.loadWorkflowDoc(workflow, routeStatus);
			workflowUpdatedAt = workflow.updatedAt;
		}
		KFK.addDocumentEventHandler(true);
		currentTool = KFK.tool;
		resetChecking();
	});
	onDestroy(async () => {
		console.log('clear ALl timer');
		clearAllTimer();
		jq(document).off();
	});

	export function showTplProp() {
		console.log('show tpl prop');
		designerCallback('showTplProp', {
			nodeType: 'TPL',
			nodeProps: { label: 'Template Properties' }
		});
	}

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
		<ListGroupItem
			class="d-flex align-items-center toolbox THROUGH {currentTool === 'THROUGH' ? 'active' : ''}"
			on:click={(event) => designerSetTool('THROUGH', event)}
			title="过渡"
		>
			<div class="shortcutkey">0</div>
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
					{#if nodeInfo.nodeType === 'TPL'}
						<div>TPLID: {template.tplid}</div>
						<div>Readonly: {readonly}</div>
						<div>Allow set PBO when</div>
						{#if readonly}
							{template.pboat === 'STARTER_START'
								? 'At start only'
								: template.pboat === 'STARTER_RUNNING'
								? 'STARTER at running task'
								: template.pboat === 'STARTER_ANY'
								? 'starter at any task'
								: template.pboat === 'ANY_RUNNING'
								? 'Anyone at running task'
								: template.pboat === 'ANY_ANY'
								? 'Anyone at anytime'
								: 'Unknown'}
						{:else}
							<Input type="select" bind:value={template.pboat}>
								<option value="STARTER_START">At start only</option>
								<option value="STARTER_RUNNING">STARTER at running task</option>
								<option value="STARTER_ANY">starter at any task</option>
								<option value="ANY_RUNNING">anyone at running task</option>
								<option value="ANY_ANY">anyone at anytime</option>
							</Input>
						{/if}
					{:else if nodeInfo.nodeType === 'ACTION'}
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
