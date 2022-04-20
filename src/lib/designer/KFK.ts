/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import suuid from 'short-uuid';
import Parser from '$lib/parser';
import cocoConfig from './cococonfig';
import APP from './appConfig';
import { Buffer } from 'buffer';
import NodeController from './NodeController';
import DesignerHelpMessage from './_designerHelpMessage';
//import RegHelper from './RegHelper';
import * as api from '$lib/api';
import type { NodePropJSON } from '$lib/types';
declare global {
	interface Array<T> {
		remove(elem: T): Array<T>;
		clear(): Array<T>;
	}
	interface Window {
		jQuery: any;
		$: any;
	}
	interface Document {
		selection: any;
	}
}

/* const SVG = async () => {
	await import('@svgdotjs/svg.js');
}; */
let SVG = null;
let jQuery = null;
let $ = null;
let history = [];
let history_pointer = 0;
import('@svgdotjs/svg.js').then((pack) => {
	SVG = pack.SVG;
});

if (!Array.prototype.remove) {
	Array.prototype.remove = function <T>(this: T[], elem: T): T[] {
		return this.filter((e) => e !== elem);
	};
}
if (!Array.prototype.clear) {
	Array.prototype.clear = function <T>(this: T[]): T[] {
		return this.splice(0, this.length);
	};
}

type Point = {
	x: number;
	y: number;
};
type Size = {
	w: number;
	h: number;
};

type Position = {
	center: Point;
	points: Point[];
};

type Rectangle = {
	left: number;
	top: number;
	right: number;
	bottom: number;
	width: number;
	height: number;
};

type User = {
	username: string;
	email: string;
	avatar: string;
	bio: string;
	sessionToken: string;
};

interface myJQuery {
	keydown: any;
	hasClass: any;
	attr: any;
	prop: any;
	find: any;
	css: any;
	append: any;
	removeAttr: any;
	addClass: any;
	removeClass: any;
	off: any;
	on: any;
	draggable: any;
	clone: any;
	hover: any;
	mousedown: any;
	click: any;
	dblclick: any;
	focus: any;
	resizable: any;
	droppable: any;
	remove: any;
	html: any;
}

function el(jq: any) {
	return jq[0];
}

const isBlank = function (val: string) {
	if (val === undefined || val === null || val === '') return true;
	else return false;
};
const blankToDefault = function (val: string, defaultValue: string) {
	if (isBlank(val)) return defaultValue;
	else return val;
};
const hasValue = function (val: string) {
	return !isBlank(val);
};

class KFKclass {
	APP: typeof APP = APP;
	showingProp: boolean = false;
	tool: string = 'POINTER';
	scenario = 'template';
	tpl: myJQuery = null;
	tplid: string = '';
	wfid: string = '';
	theWf: any = null;
	tpl_mode: string = 'read';
	version: string = '1.0';
	inNoteEditor: boolean = false;
	config: typeof cocoConfig = cocoConfig;
	duringVideo: boolean = false;
	HSpace: number = 80;
	VSpace: number = 20;
	tmpBalls: any[] = [];
	mdnotes: any = null;
	noCopyPaste: boolean = false;
	scaleRatio: number = 1;
	currentPage: number = 0;
	loadedProjectId: string = null;
	keypool: string = '';
	closeHelpTimer: any = null;
	keypoolCleanTimeout: any = null;
	svgDraw: any = null; //画svg的画布
	helpArea: any = null;
	isFreeHandDrawing: boolean = false;
	isShowingModal: boolean = false;
	toolboxMouseDown: boolean = false;
	isZoomingShape: boolean = false;
	ctrlMouseToPan: boolean = false;
	FROM_SERVER: boolean = true;
	FROM_CLIENT: boolean = false;
	NO_SHIFT: boolean = false;
	badgeTimers: any = {}; //用于存放用户badge显示间隔控制的timer，这样，不是每一个mousemove都要上传，在Timer内，只上传最后一次mouse位置
	msgTimer: any = null;
	nodeMessageTimer: any = null;
	templateChangeTimer: any = null;
	scrollPosTimer: any = null;
	updateReceived: number = 0; //记录接收到的其他用户的改动次数，在startActiveLogWatcher中，使用这个数字来控制是否到服务器端去拉取更新列表
	tempSvgLine: any = null; //这条线是在划线或者链接node时，那条随着鼠标移动的线
	LOGLEVEL_NOTHING: number = 0;
	LOGLEVEL_ERROR: number = 1;
	LOGLEVEL_WARN: number = 2;
	LOGLEVEL_INFO: number = 3;
	LOGLEVEL_DEBUG: number = 4;
	LOGLEVEL_DETAIL: number = 5;
	LOGLEVEL_KEY: number = 6;
	tplNode_width: number = 32;
	tplNode_height: number = 32;
	loglevel: number = 5; //控制log的等级, 级数越小，显示信息越少
	//在designer页面输入logerror, logwarn, loginfo, lodebug...
	designerConf: any = { scale: 1, left: 0, top: 0 }; //用于在zoom控制计算中

	state: any = { TRX_FLAG: 0 };
	CONST: any = { THIS_IS_A_UNDOREDO: true, THIS_IS_NOT_A_UNDOREDO: false, MAX_SHAPE_WIDTH: 6 };
	opArray: any[] = [];
	opstack: any[] = []; //Operation Stack, 数组中记录操作记录，用于undo/redo
	opstacklen: number = 20; //undo，redo记录次数
	opz: number = -1; // opstack 当前记录指针
	lockTool: boolean = false;
	C3: any = null;
	JC3: any = null;
	onC3: boolean = false;
	tapped: boolean = false;
	inFullScreenMode: boolean = false;
	inPresentingMode: boolean = false;
	inOverviewMode: boolean = false;
	controlButtonsOnly: boolean = false;
	showRightTools: boolean = true;
	zoomFactor: number = 0;
	lineTransfomerDragging: boolean = false;
	scaleBy: number = 1.01;
	centerPos: any = { x: 0, y: 0 };
	lastFocusOnJqNode: myJQuery = null;
	lastSetNoteJq: myJQuery = null;
	clipboardNode: myJQuery = null;
	clipboardConnectText: string = null;
	justCreatedJqNode: any = null;
	lastCreatedJqNode: any = null;
	justCreatedShape: any = null;
	_jqhoverdiv: any = null;
	_svghoverline: any = null;
	inited: boolean = false;
	divInClipboard: any = undefined;
	lineTemping: boolean = false;
	ignoreClick: boolean = false;
	scrollBugPatched: boolean = false;
	actionLogToView: any = { editor: '', actionlog: [] };
	actionLogToViewIndex: number = 0;
	explorerRefreshed: boolean = false;
	numberOfNodeToCreate: number = 0;
	numberOfNodeCreated: number = 0;
	firstShown: any = { right: false, chat: false };
	badgeIdMap: any = {};
	// A4
	// PageWidth : 842,
	// PageHeight : 595,
	//上面是A4的真实大小,但因为网格线是20位单位,所以近似看下面两个值
	PageWidth: number = 0;
	PageHeight: number = 0;
	PageNumberHori: number = 0;
	PageNumberVert: number = 0;
	LeftB: number = 0;
	TopB: number = 0;
	bestViewTop: number = 200; //用于空开上部和左部的菜单
	bestViewLeft: number = 200;
	_width = 0;
	_height: number = 0;
	minimapMouseDown: boolean = false;

	defaultNodeWidth: number = 40;
	defaultNodeHeight: number = 40;
	links: any[] = [];
	tipLinks: any[] = [];
	tips: any[] = [];
	images: any = {};
	avatars: any = {};
	pickedNode: any = null;
	pickedTip: any = null;
	isEditting: boolean = false;
	resizing: boolean = false;
	dragging: boolean = false;
	shapeDragging: boolean = false;
	afterDragging: boolean = false;
	afterResizing: boolean = false;
	linkPosNode: any[] = [];
	jumpNodes: any[] = [];
	drawPoints: any[] = [];
	drawMode: string = 'line';
	KEYDOWN: any = { ctrl: false, shift: false, alt: false, meta: false };
	originZIndex: number = 1;
	lastActionLogJqDIV: any = null;
	brainstormMode: boolean = true;
	JC1: any = null;
	C1: any = null;
	JS1: any = null;
	S1: any = null;
	scrollContainer: any = null;
	lockMode: boolean = false;
	selectedDIVs: any[] = [];
	selectedConnects: any[] = [];
	selectedShapes: any[] = [];
	kuangXuanMouseIsDown: boolean = false;
	kuangXuanStartPoint: any = { x: 0, y: 0 };
	kuangXuanEndPoint: any = { x: 0, y: 0 };
	duringKuangXuan: boolean = false;
	currentMousePos: Point = { x: -1, y: -1 };
	JCBKG: any = null;
	hoveredConnectId: string = null;
	hoveredConnect: any = null;
	tmpPos: Position = null;
	shapeToRemember: myJQuery = null;
	polyId: string = '';
	polyShape: myJQuery = null;
	pickedShape: myJQuery = null;
	tempShape: any = null;
	YIQColorAux: string = '';
	tobeTransformJqLine: myJQuery = null;
	materialPicked: any = null;
	panStartAt: Point = null;
	refreshC3Event: any = null;
	zoomEvent: any = null;
	changedEvent: any = null;
	shapeOriginColor: string = '';
	currentJqNode: myJQuery = null;
	moveLinePoint: string = 'from';
	lineToResize: any = null;
	mousePosToRemember: Point = null;
	shapeToZoom: any = null;
	shapeSizeCenter: Point = null;
	shapeSizeOrigin: Size = null;
	shapeZoomStartPoint: Point = null;

	shapeToDrag: any = null;
	shapeDraggingStartPoint: Point = null;
	shapeFirstDraggingStartPoint: Point = null;

	fromJQ: myJQuery = null;
	positionBeforeDrag: Point = null;
	DivStyler: any = null;
	AdvOps: any = null;
	shouldMovedInParalles: any[] = [];
	edittingJQ: boolean = false;
	ball: any = false;
	inlineEditor: myJQuery = null;
	copyCandidateDIVs: any[] = [];
	copyCandidateLines: any[] = [];
	lineToCopy: any = null;
	YIQColor: string = '';
	template: any = null;
	pageBounding: any = null;
	urlBase: string = 'urlBase://';
	NodeController: any = NodeController;
	documentEventHandlerSet: boolean = false;
	globalMouseX: number = 0;
	globalMouseY: number = 0;
	pasteAt: Point = { x: 0, y: 0 };
	fileToUpload: any = null;
	blobToPaste: any = null;
	workflow: any = null;
	dropAtPos: Point = { x: 0, y: 0 };
	sts: string = null;
	pointAfterResize: Point = null;
	selectedTodo: any = null;
	user: User = null;
	bwid: string = '';
	isMobile: boolean = false;
	showNodeId: boolean = false;

	tobeRemovedConnectId: string = null;
	oldTool = 'POINTER';
	tmpTool = null;
	movingConnect: boolean = false;
	designerCallback = null;
	connectEndFirst = false;
	movingEnd: boolean = false;

	constructor() {
		let that = this;
		import('jquery').then((pack) => {
			jQuery = pack.default;
			$ = jQuery;
			if (typeof window !== 'undefined') {
				window.jQuery = jQuery;
				window.$ = jQuery;
			}
			that.JC1 = $('#C1');
			that.C1 = el(that.JC1);
			that.JCBKG = $('#containerbkg');
			that.PageWidth = 840 * 2;
			that.PageHeight = 600 * 2;
			that.PageNumberHori = 2;
			that.PageNumberVert = 2;
			that.LeftB = that.PageWidth;
			that.TopB = that.PageHeight;
			that._width = that.PageWidth * that.PageNumberHori;
			that._height = that.PageHeight * that.PageNumberVert;
			that.scrollContainer = $('#S1');
			that.designerCallback = null;
		});
	}

	// eslint-disable-next-line
	static NotSet(val: any): boolean {
		if (val === undefined || val === null) return true;
		else return false;
	}

	// eslint-disable-next-line
	static IsSet(val: any): boolean {
		return !KFKclass.NotSet(val);
	}
	static px(v: any) {
		if (typeof v === 'string') {
			if (v.endsWith('px')) {
				return v;
			} else {
				return v + 'px';
			}
		} else {
			return v + 'px';
		}
	}

	static unpx(v: any) {
		if (typeof v === 'string' && v.endsWith('px')) {
			return parseInt(v.substr(0, v.length - 2));
		} else {
			return v;
		}
	}
	static hide(jq: any) {
		if (typeof jq === 'string') jq = $(jq);
		jq.addClass('noshow');
	}
	static show(jq: any) {
		if (typeof jq === 'string') jq = $(jq);
		jq.removeClass('noshow');
	}
	static mouseNear(p1: Point, p2: Point, distance: number) {
		return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) <= distance;
	}

	static moveDIVCenterToPos(jqDiv: myJQuery, pos: Point) {
		jqDiv.css('left', pos.x - KFKclass.unpx(jqDiv.css('width')) * 0.5);
		jqDiv.css('top', pos.y - KFKclass.unpx(jqDiv.css('height')) * 0.5);
	}

	C3MousePos(evt: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return {
			x: that.scalePoint(that.scrXToJc3X(evt.clientX)),
			y: that.scalePoint(that.scrYToJc3Y(evt.clientY))
		};
	}
	ScreenMousePos(pos: Point) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return {
			x: pos.x - that.scrollContainer.scrollLeft(),
			y: pos.y - that.scrollContainer.scrollTop()
		};
	}
	hideLineTransformer() {
		KFKclass.hide($('#linetransformer'));
	}
	showLineTransformer() {
		KFKclass.show($('#linetransformer'));
	}
	cancelTempLine() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.lineTemping) {
			that.lineTemping = false;
			if (that.tempSvgLine) that.tempSvgLine.hide();
			that.linkPosNode.clear();
			that.drawPoints.clear();
		}
	}
	//select tool set tool settool
	setTool(tool: string, event?: any): void {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.docIsReadOnly()) tool = 'POINTER';

		const shiftKey = event ? event.shiftKey : false;

		that.oldTool = that.tool;
		that.tool = tool;
		for (const key in that.APP.toolActiveState) {
			that.APP.toolActiveState[key] = false;
		}
		if (that.APP.toolActiveState[tool] == undefined)
			console.warn(`APP.toolActiveState[${tool}] does not exist`);
		else that.APP.toolActiveState[tool] = true;

		if (
			(that.oldTool === 'line' && tool !== 'line') ||
			(that.oldTool === 'CONNECT' && tool !== 'CONNECT')
		) {
			that.cancelTempLine();
		}

		if (shiftKey) {
			if (that.tool === 'CONNECT') {
				that.lockTool = true;
			} else {
				that.lockTool = false;
			}
		} else {
			that.lockTool = false;
		}

		$('#modeIndicator').hide();

		if (that.tool === 'text') {
			that.APP.setData('show', 'shape_property', true);
			that.APP.setData('show', 'customshape', false);
			that.APP.setData('show', 'custombacksvg', false);
			that.APP.setData('show', 'customfont', true);
			that.APP.setData('show', 'layercontrol', true);
			that.APP.setData('show', 'customline', false);
		} else if (that.tool === 'textblock') {
			that.APP.setData('show', 'shape_property', true);
			that.APP.setData('show', 'customshape', true);
			that.APP.setData('show', 'customfont', true);
			that.APP.setData('show', 'custombacksvg', true);
			that.APP.setData('show', 'layercontrol', true);
			that.APP.setData('show', 'customline', false);
		} else if (that.tool === 'yellowtip' || that.tool === 'comment') {
			that.APP.setData('show', 'shape_property', true);
			that.APP.setData('show', 'customfont', true);
			that.APP.setData('show', 'custombacksvg', true);
			that.APP.setData('show', 'customshape', false);
			that.APP.setData('show', 'layercontrol', true);
			that.APP.setData('show', 'customline', false);
		} else if (that.tool === 'line') {
			that.APP.setData('show', 'shape_property', true);
			that.APP.setData('show', 'customshape', false);
			that.APP.setData('show', 'custombacksvg', false);
			that.APP.setData('show', 'customfont', false);
			that.APP.setData('show', 'layercontrol', false);
			that.APP.setData('show', 'customline', true);
		}
		that.designerCallback('setTool', tool);
		if (DesignerHelpMessage[tool]) that.showHelp(DesignerHelpMessage[tool]);
		that.focusOnC3();
	}

	docIsReadOnly(): boolean {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return (
			(that.tpl_mode !== 'edit' && that.scenario === 'template') || that.scenario === 'workflow'
		);
	}

	docIsNotReadOnly(): boolean {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return !that.docIsReadOnly();
	}

	nodeLocked(jqNode: myJQuery): boolean {
		//Even works for svline, because svg line has .hasClass function as well
		return jqNode.hasClass('lock');
	}

	lineLocked(svgLine: myJQuery): boolean {
		return svgLine.hasClass('lock');
	}

	static stringToArray(str: string): string[] {
		let arr: string[] = [];
		if (str) {
			arr = str.split(',');
			if (arr.length === 1 && arr[0] === '') arr = [];
		}
		return arr;
	}

	getNodeLinkIds(jq1: myJQuery, direction: string): string[] {
		const linksStr: string = jq1.attr(direction);
		const linksArr: string[] = KFKclass.stringToArray(linksStr);
		return linksArr;
	}

	getNodeIdsFromConnectId(cid: string) {
		let nid = cid;
		let tid = cid;
		nid = nid.substr(nid.indexOf('_') + 1);
		nid = nid.substr(0, nid.indexOf('_'));
		tid = tid.substr(tid.lastIndexOf('_') + 1);
		return [nid, tid];
	}

	/**
	 * Remove connection link
	 */
	async removeConnectById(connect_id: string): Promise<void> {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.ball.addClass('noshow');
		that.ball.timeline().stop();
		try {
			await that.svgDraw.find(`.${connect_id}`).remove();
			//eslint-disable-next-line
		} catch (err) {}
		const triangle_id = connect_id + '_triangle';
		try {
			await that.svgDraw.find(`.${triangle_id}`).remove();
			//eslint-disable-next-line
		} catch (err) {}
		const text_id = connect_id + '_text';
		try {
			await that.svgDraw.find(`.${text_id}`).remove();
			//eslint-disable-next-line
		} catch (err) {}
		try {
			const tmpNodeIdPair = that.getNodeIdsFromConnectId(connect_id);
			const fromNode_id = tmpNodeIdPair[0];
			const toNode_id = tmpNodeIdPair[1];
			const aLinkInTemplate = that.tpl.find(`.link[from="${fromNode_id}"][to="${toNode_id}"]`);
			$(aLinkInTemplate).remove();

			const ballConnectAttr = `${fromNode_id}_${toNode_id}`;
			for (let i = 0; i < that.tmpBalls.length; i++) {
				if (that.tmpBalls[i].attr('connect') === ballConnectAttr) {
					that.tmpBalls[i].addClass('noshow');
				}
			}
		} catch (err) {
			console.error(err);
		}
	}

	C3GotFocus() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.onC3 = true;
	}

	C3Blur() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.onC3 = false;
	}

	getScrollPos() {
		const sc = $('#S1');
		return {
			x: sc.scrollLeft(),
			y: sc.scrollTop()
		};
	}
	codeToBase64(code: string) {
		return Buffer.from(code).toString('base64');
	}
	base64ToCode(base64: string) {
		return Buffer.from(base64, 'base64').toString('utf-8');
	}

	//Following solution to prevetn scrolling after focus  cause a problem of juqery
	//So, dont' use it but adapt getScrollPos then scrollToPos solution
	//https://stackoverflow.com/questions/4963053/focus-to-input-without-scrolling
	// element.focus({
	//     preventScroll: true
	//   });
	focusOnC3() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.isEditting || that.resizing || that.dragging) return;
		return;
	}

	myuid() {
		return suuid.generate();
	}

	getNodeLabel(jqDIV: myJQuery) {
		let node_label = '';
		if (jqDIV.find('p').length > 0) {
			node_label = jqDIV.find('p').first().text().trim();
		}
		return node_label;
	}
	setNodeLabel(jqDIV: myJQuery, label: string) {
		let isDirty = false;
		label = label.trim();
		let node_label = '';
		if (jqDIV.find('p').length > 0) {
			node_label = jqDIV.find('p').first().text().trim();
			if (node_label !== label) {
				isDirty = true;
				jqDIV.find('p').first().prop('innerText', label);
			}
		} else {
			jqDIV.append('<p>' + label + '</p>');
			isDirty = true;
		}
		return isDirty ? 1 : 0;
	}

	setNodeId(jqDIV: myJQuery, id: string) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		let isDirty = false;
		if (jqDIV.attr('id').trim() !== id.trim() && hasValue(id.trim())) {
			jqDIV.attr('id', id.trim());
			isDirty = true;
		}
		if (isBlank(id.trim())) {
			if (isBlank(jqDIV.attr('id').trim())) {
				jqDIV.attr('id', that.myuid());
				isDirty = true;
			}
		}
		return isDirty ? 1 : 0;
	}
	//
	//删除添加eventHandler带来的额外的、会引起复制节点event响应不正常的内容
	removeNodeEventFootprint(jqNodeDIV: myJQuery) {
		jqNodeDIV.find('.mobilehandler').remove();
		jqNodeDIV.find('.nodeidlabel').remove();
		jqNodeDIV.find('.ui-resizable-handle').remove();
		jqNodeDIV.find('.locklabel').remove();
		jqNodeDIV.removeClass(
			'ui-resizable ui-draggable ui-draggable-handle ui-draggable-dragging ui-droppable selected ui-resizable-autohide shadow1 shadow2 lock'
		);
	}
	idsOfNodesToThis(jcNode) {
		let that = this;
		let ret = [];
		let connectsToThis = that.JC3.find(`.connect[tid="${jcNode.attr('id')}"]`);
		let number = connectsToThis.length;
		for (let i = 0; i < number; i++) {
			let jqC = $(connectsToThis[i]);
			let fid = jqC.attr('fid');
			ret.push(fid);
		}
		return ret;
	}

	toStart(jcNode, backPaths) {
		let that = this;
		let id = jcNode.attr('id');
		if (jcNode.hasClass('START')) {
			backPaths.push(id);
			return;
		} else {
			if (backPaths.includes(id)) return;
			else {
				backPaths.push(id);
				let ids = that.idsOfNodesToThis(jcNode);
				for (let i = 0; i < ids.length; i++) {
					that.toStart(that.JC3.find('#' + ids[i]).first(), backPaths);
				}
			}
		}
	}

	setAndORCounterPart(jcAnd) {
		let that = this;
		let andId = jcAnd.attr('id');
		let ids = that.idsOfNodesToThis(jcAnd);
		let paths = [];
		for (let i = 0; i < ids.length; i++) {
			paths.push([andId]);
		}
		for (let i = 0; i < ids.length; i++) {
			that.toStart(that.JC3.find('#' + ids[i]).first(), paths[i]);
		}
		console.log(JSON.stringify(paths, null, 2));
		//TODO: check paths
		let counterPart = 'start';
		//应该有多于一条的路径
		if (paths.length > 1) {
			let result = paths[0];
			for (let i = 1; i < ids.length; i++) {
				result = result.filter((x) => paths[i].includes(x));
			}
			if (result.length > 1) {
				//除自身外（下标为0），第一个为counterPart（下标为1）
				counterPart = result[1];
			}
		} else {
			counterPart = paths[0][1];
		}
		jcAnd.attr('cp', counterPart);
	}

	setAndORGraph() {
		let that = this;

		//给每个AND找到自己的counterPart。
		const andNodes = that.JC3.find('.node.AND');
		for (let i = 0; i < andNodes.length; i++) {
			that.setAndORCounterPart($(andNodes[i]));
		}
		const orNodes = that.JC3.find('.node.OR');
		for (let i = 0; i < orNodes.length; i++) {
			that.setAndORCounterPart($(orNodes[i]));
		}
	}

	//onSave onsave on Save  on save
	//on upload
	drawingToTemplateDoc() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.setAndORGraph();
		const nodes = that.JC3.find('.node');
		const connects = that.svgDraw.find('.connect');
		let tplDocHtml = `<div class="template">`;

		nodes.each((_index: any, aNode: any) => {
			//eslint-disable-line
			const origJqNode = $(aNode);
			//eslint-disable-next-line
			let jqNode: myJQuery = origJqNode.clone();
			that.removeNodeEventFootprint(jqNode);
			jqNode.removeClass('kfknode');
			const nodeHtml = jqNode.prop('outerHTML');
			tplDocHtml += nodeHtml;
		});
		connects.each((aConnect: any) => {
			let linkHtml = `<div class="link" from="${aConnect.attr('fid')}" to="${aConnect.attr(
				'tid'
			)}">link</div>`;
			let caseSeg = Parser.isEmpty(aConnect.attr('case')) ? '' : `case="${aConnect.attr('case')}"`;
			let setSeg = Parser.isEmpty(aConnect.attr('set')) ? '' : `set="${aConnect.attr('set')}"`;
			linkHtml = `<div class="link" from="${aConnect.attr('fid')}" to="${aConnect.attr(
				'tid'
			)}" ${caseSeg} ${setSeg}>link</div>`;
			tplDocHtml += linkHtml;
		});
		tplDocHtml += '</div>';

		return tplDocHtml;
	}

	onChange(reason: string) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		console.log('onChange ', reason);
		that.templateChangeTimer && clearTimeout(that.templateChangeTimer);
		const tpldoc = that.drawingToTemplateDoc();
		if (['UNDO', 'REDO'].includes(reason) === false) {
			history.splice(history_pointer);
			history.push(tpldoc);
			history_pointer++;
		}
		that.template.doc = tpldoc;
		that.designerCallback('setTemplate', that.template);

		that.templateChangeTimer = setTimeout(async () => {
			//eslint-disable-next-line
			//Client.putTemplate(tpldoc);
			const token = that.user.sessionToken;
			const ret = await api.post(
				'template/put',
				{
					doc: that.template.doc,
					tplid: that.tplid,
					bwid: that.bwid,
					lastUpdatedAt: that.template.updatedAt
				},
				token
			);
			if (
				ret.error &&
				['CHECK_LASTUPDATEDAT_FAILED', 'LOCK_FAILED', 'BWID_FAILED'].includes(ret.error)
			) {
				console.log(ret.message);
				that.designerCallback('confirmReload', that.template);
			} else {
				that.template.updatedAt = ret.updatedAt;
				that.designerCallback('changeSaved', that.template);
			}

			that.templateChangeTimer = undefined;
		}, 1000);
	}

	/**
	 * nodeToAppData.
	 * set App data with Node properties
	 *
	 * @param {} jqDIV
	 */
	async getNodeProperties(jqDIV?: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const ret = {
			ACTION: {
				id: '',
				role: '',
				label: '',
				bot: { wecom: false },
				kvars: '',
				byall: true,
				csv: '',
				withcsv: false,
				allowpbo: false,
				vote: '',
				vote_any: '',
				vote_failto: '',
				vote_percent: 60,
				doer: '',
				instruct: '',
				transferable: false,
				sr: false,
				withsb: false,
				withrvk: false,
				withadhoc: false,
				withcmt: true
			},
			SCRIPT: { id: '', label: '', code: '', runmode: 'ASYNC' },
			INFORM: { id: '', label: '', role: '', subject: '', content: '' },
			TIMER: { id: '', label: '', code: '' },
			//alone: means not a sub process, but a standalone process
			SUB: { id: '', label: '', sub: '', alone: false },
			AND: { id: '', label: '' },
			label: ''
		};
		if (KFKclass.NotSet(jqDIV)) jqDIV = that.currentJqNode;
		if (jqDIV.hasClass('START')) {
			ret.label = 'START';
		} else if (jqDIV.hasClass('ACTION')) {
			ret.ACTION.id = jqDIV.attr('id').trim();
			ret.ACTION.role = blankToDefault(jqDIV.attr('role'), 'DEFAULT');
			ret.ACTION.label = blankToDefault(jqDIV.find('p').first().text(), 'Activity').trim();
			ret.ACTION.bot.wecom =
				blankToDefault(jqDIV.attr('wecom'), 'false').toLowerCase() === 'true' ? true : false;
			ret.label = ret.ACTION.label;
			//TODO: here, read kvars from Mongo for workflow
			let kvarsString = blankToDefault(jqDIV.find('.kvars').text(), 'e30=');
			kvarsString = that.base64ToCode(kvarsString); //TO JSON.stringified string
			ret.ACTION.kvars = JSON.parse(kvarsString); //to JSON
			ret.ACTION.byall = jqDIV.hasClass('BYALL');
			ret.ACTION.csv = blankToDefault(jqDIV.attr('csv'), '');
			ret.ACTION.withcsv = ret.ACTION.csv !== '';
			ret.ACTION.allowpbo = blankToDefault(jqDIV.attr('pbo'), 'no') === 'yes';
			ret.ACTION.vote = jqDIV.attr('vote') ? jqDIV.attr('vote').trim() : '';
			ret.ACTION.vote_any = jqDIV.attr('vote_any') ? jqDIV.attr('vote_any').trim() : '';
			ret.ACTION.vote_failto = jqDIV.attr('vote_failto') ? jqDIV.attr('vote_failto').trim() : '';
			ret.ACTION.vote_percent = jqDIV.attr('vote_percent')
				? parseInt(jqDIV.attr('vote_percent').trim())
				: 60;
			ret.ACTION.instruct = that.base64ToCode(blankToDefault(jqDIV.find('.instruct').text(), ''));
			ret.ACTION.transferable = blankToDefault(jqDIV.attr('transferable'), 'no') === 'yes';
			ret.ACTION.sr = blankToDefault(jqDIV.attr('sr'), 'no') === 'yes';
			ret.ACTION.withsb = blankToDefault(jqDIV.attr('sb'), 'no') === 'yes';
			ret.ACTION.withrvk = blankToDefault(jqDIV.attr('rvk'), 'no') === 'yes';
			ret.ACTION.withadhoc = blankToDefault(jqDIV.attr('adhoc'), 'yes') === 'yes';
			ret.ACTION.withcmt = blankToDefault(jqDIV.attr('cmt'), 'yes') === 'yes';

			if (that.workflow) {
				let theWork = jqDIV.find('.work').first();
				ret.ACTION.kvars = (await api.post(
					'workflow/kvars',
					{ wfid: that.wfid, workid: theWork.attr('id') },
					that.user.sessionToken
				)) as any;
				ret.ACTION.doer = theWork.attr('doer');
				//let kvarsString = blankToDefault(theWork.find('.kvars').text(), 'e30=');
				//kvarsString = that.base64ToCode(kvarsString);
			}
		} else if (jqDIV.hasClass('SCRIPT')) {
			ret.SCRIPT.id = jqDIV.attr('id');
			ret.SCRIPT.runmode = jqDIV.attr('runmode') ? jqDIV.attr('runmode') : 'SYNC';
			ret.SCRIPT.label = blankToDefault(jqDIV.find('p').first().text(), 'Script').trim();
			ret.label = ret.SCRIPT.label;
			let defaultScript = that.codeToBase64(
				`// read Hyperflow Developer's Guide for details
ret='DEFAULT'; `
			);
			let str = blankToDefault(jqDIV.find('code').first().text(), defaultScript).trim();
			str = that.base64ToCode(str);
			ret.SCRIPT.code = str;
		} else if (jqDIV.hasClass('INFORM')) {
			ret.INFORM.id = jqDIV.attr('id');
			ret.INFORM.label = blankToDefault(jqDIV.find('p').first().text(), 'Email').trim();
			ret.label = ret.INFORM.label;
			ret.INFORM.role = blankToDefault(jqDIV.attr('role'), 'DEFAULT');
			ret.INFORM.subject = that.base64ToCode(
				blankToDefault(jqDIV.find('subject').first().text(), '').trim()
			);
			ret.INFORM.content = that.base64ToCode(
				blankToDefault(jqDIV.find('content').first().text(), '').trim()
			);
		} else if (jqDIV.hasClass('TIMER')) {
			ret.TIMER.id = jqDIV.attr('id');
			ret.TIMER.label = blankToDefault(jqDIV.find('p').first().text(), 'Timer').trim();
			ret.label = ret.TIMER.label;
			const str = blankToDefault(jqDIV.find('code').first().text(), '').trim();
			ret.TIMER.code = str;
		} else if (jqDIV.hasClass('SUB')) {
			ret.SUB.id = jqDIV.attr('id');
			ret.SUB.label = blankToDefault(jqDIV.find('p').first().text(), 'Sub').trim();
			ret.label = ret.SUB.label;
			ret.SUB.sub = blankToDefault(jqDIV.attr('sub'), '').trim();
			//alone: means not a sub process, but a standalone process
			ret.SUB.alone = blankToDefault(jqDIV.attr('alone'), 'no') === 'yes';
		} else if (jqDIV.hasClass('AND')) {
			ret.AND.id = jqDIV.attr('id');
			ret.AND.label = 'AND';
			ret.label = ret.AND.label;
		}
		return ret;
	}

	setNodeProperties(jqDIV: myJQuery, props: any) {
		let that = this;
		let propJSON: NodePropJSON;
		if (jqDIV.hasClass('ACTION')) {
			propJSON = props.ACTION;
			this.setNodeLabel(jqDIV, propJSON.label);
			jqDIV.attr('role', propJSON.role.trim());
			jqDIV.attr('wecom', propJSON.bot.wecom ? 'true' : 'false');
			if (propJSON.withcsv && propJSON.csv && propJSON.csv.trim())
				jqDIV.attr('csv', propJSON.csv.trim());
			else jqDIV.removeAttr('csv');
			if (propJSON.allowpbo) jqDIV.attr('pbo', 'yes');
			else jqDIV.removeAttr('pbo');
			const kvars_json = Parser.arrayToKvars(props.kvarsArr);
			const kvars_string = JSON.stringify(kvars_json);
			const codeInBase64 = Parser.codeToBase64(kvars_string);
			let kvarsChildren = jqDIV.find('.kvars');
			if (kvarsChildren.length === 0) {
				jqDIV.append('<div class="kvars">' + codeInBase64 + '</div>');
			} else {
				jqDIV.find('.kvars').first().prop('innerText', codeInBase64);
			}
			const instructInBase64 = Parser.codeToBase64(propJSON.instruct);
			let instructChildren = jqDIV.find('.instruct');
			if (instructChildren.length === 0) {
				jqDIV.append('<div class="instruct">' + instructInBase64 + '</div>');
			} else {
				jqDIV.find('.instruct').first().prop('innerText', instructInBase64);
			}
			if (propJSON.byall) {
				jqDIV.addClass('BYALL');
				if (propJSON.vote) {
					jqDIV.attr('vote', propJSON.vote);
					jqDIV.attr('vote_any', propJSON.vote_any);
					jqDIV.attr('vote_failto', propJSON.vote_failto);
					jqDIV.attr('vote_percent', propJSON.vote_percent);
				} else {
					jqDIV.attr('vote', '');
				}
			} else {
				jqDIV.removeClass('BYALL');
			}
			jqDIV.attr('transferable', propJSON.transferable ? 'yes' : 'no');
			jqDIV.attr('sr', propJSON.sr ? 'yes' : 'no');
			jqDIV.attr('sb', propJSON.withsb ? 'yes' : 'no');
			jqDIV.attr('rvk', propJSON.withrvk ? 'yes' : 'no');
			jqDIV.attr('adhoc', propJSON.withadhoc ? 'yes' : 'no');
			jqDIV.attr('cmt', propJSON.withcmt ? 'yes' : 'no');
		} else if (jqDIV.hasClass('SCRIPT')) {
			propJSON = props.SCRIPT;
			this.setNodeLabel(jqDIV, propJSON.label);
			jqDIV.attr('runmode', propJSON.runmode.trim());
			const code = propJSON.code;
			const appData_code = code.trim();
			let codeInBase64 = '';
			if (hasValue(appData_code)) {
				codeInBase64 = this.codeToBase64(appData_code);
			}
			if (jqDIV.find('code').length > 0) {
				if (jqDIV.find('code').first().text().trim() !== codeInBase64) {
					jqDIV.find('code').prop('innerText', codeInBase64);
				}
			} else {
				jqDIV.append('<code>' + codeInBase64 + '</code>');
			}
		} else if (jqDIV.hasClass('INFORM')) {
			propJSON = props.INFORM;
			this.setNodeLabel(jqDIV, propJSON.label);
			const subject = that.codeToBase64(propJSON.subject);
			const content = that.codeToBase64(propJSON.content);
			const role = propJSON.role;
			let node_subject = '';
			let node_content = '';
			let theRole = jqDIV.attr('role');
			theRole = theRole ? theRole.trim() : '';
			if (theRole !== role.trim() && role.trim() !== 'DEFAULT' && hasValue(role.trim())) {
				jqDIV.attr('role', role.trim());
			}
			if (jqDIV.find('subject').length > 0) {
				node_subject = jqDIV.find('subject').first().text().trim();
				if (node_subject !== subject) {
					jqDIV.find('subject').prop('innerText', subject);
				}
			} else {
				jqDIV.append('<subject>' + subject + '</subject>');
			}
			if (jqDIV.find('content').length > 0) {
				node_content = jqDIV.find('content').first().text().trim();
				if (node_content !== content) {
					jqDIV.find('content').prop('innerText', content);
				}
			} else {
				jqDIV.append('<content>' + content + '</content>');
			}
		} else if (jqDIV.hasClass('TIMER')) {
			propJSON = props.TIMER;
			this.setNodeLabel(jqDIV, propJSON.label);
			const appData_code = propJSON.code.trim();
			if (jqDIV.find('code').length > 0) {
				if (jqDIV.find('code').first().text().trim() !== appData_code) {
					jqDIV.find('code').prop('innerText', appData_code);
				}
			} else {
				jqDIV.append('<code>' + appData_code + '</code>');
			}
		} else if (jqDIV.hasClass('SUB')) {
			propJSON = props.SUB;
			const appData_code = propJSON.sub.trim();
			this.setNodeLabel(jqDIV, propJSON.label);
			jqDIV.attr('sub', appData_code);
			jqDIV.attr('alone', propJSON.alone ? 'yes' : 'no');
			//alone: means not a sub process, but a standalone process
			if (propJSON.alone) {
				jqDIV.attr('alone', 'yes');
			}
		}
		this.onChange('Property Changed');
	}
	//on click node, node prop
	async showNodeProperties(jqDIV: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.showingProp = true;
		const nodeProps = await that.getNodeProperties(jqDIV);
		if (jqDIV.hasClass('SCRIPT')) {
			that.designerCallback('showNodeProp', {
				nodeType: 'SCRIPT',
				jqDiv: jqDIV,
				nodeProps: nodeProps
			});
		} else if (jqDIV.hasClass('ACTION')) {
			that.designerCallback('showNodeProp', {
				nodeType: 'ACTION',
				jqDiv: jqDIV,
				nodeProps: nodeProps,
				nodes: that.JC3.find('.node')
			});
		} else if (jqDIV.hasClass('INFORM')) {
			that.designerCallback('showNodeProp', {
				nodeType: 'INFORM',
				jqDiv: jqDIV,
				nodeProps: nodeProps,
				nodes: that.JC3.find('.node')
			});
		} else if (jqDIV.hasClass('TIMER')) {
			that.designerCallback('showNodeProp', {
				nodeType: 'TIMER',
				jqDiv: jqDIV,
				nodeProps: nodeProps
			});
		} else if (jqDIV.hasClass('SUB')) {
			that.designerCallback('showNodeProp', {
				nodeType: 'SUB',
				jqDiv: jqDIV,
				nodeProps: nodeProps
			});
		}

		return;
	}

	showConnectionProperties(theConnect) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		this.designerCallback('showConnectProp', {
			nodeType: 'CONNECT',
			theConnect: theConnect,
			caseValue: theConnect.attr('case'),
			setValue: theConnect.attr('set'),
			nodeProps: { label: 'Connect' }
		});
	}

	async setConnectText(theConnect: any, caseValue: string, setValue: string = '') {
		const that = this;
		theConnect.attr('case', caseValue);
		let base64Set = setValue;
		if (setValue) {
			base64Set = that.codeToBase64(setValue);
		}
		setValue && theConnect.attr('set', base64Set);
		const tplLinks = that.tpl.find(
			`.link[from="${theConnect.attr('fid')}"][to="${theConnect.attr('tid')}"]`
		);
		for (let i = 0; i < tplLinks.length; i++) {
			$(tplLinks[i]).attr('case', caseValue);
			setValue && $(tplLinks[i]).attr('set', base64Set);
		}

		await that.redrawLinkLines(that.JC3.find(`#${theConnect.attr('fid')}`), 'after moving');

		that.onChange('Connect case Changed');
	}

	async setConnectProperties(theConnect: any, caseValue = '', setValue = '') {
		let tmp = caseValue.trim();
		caseValue = Parser.isEmpty(tmp) ? '' : tmp;
		tmp = setValue.trim();
		setValue = Parser.isEmpty(tmp) ? '' : tmp;
		await this.setConnectText(theConnect, caseValue, setValue);
	}

	focusOnNode(jqNodeDIV: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.lastFocusOnJqNode = jqNodeDIV;
		that.lastSetNoteJq = jqNodeDIV;
		that.justCreatedJqNode = null;
		that.justCreatedShape = null;
	}

	/**
	 * 切换备注编辑器全屏显示状态时顶部菜单栏的显示,编辑器全屏,隐藏菜单栏,编辑器复原,恢复菜单栏
	 */

	/**
	 * 切换备注编辑器显示与否
	 *
	 */

	/**
	 * 把备注编辑器的内容设置为节点的备注
	 *
	 */

	log(...info: any[]) {
		console.log('LOG>', ...info);
	}
	error(...info: any[]) {
		if (this.loglevel >= this.LOGLEVEL_ERROR) console.log('ERROR>', ...info);
	}
	warn(...info: any[]) {
		if (this.loglevel >= this.LOGLEVEL_WARN) console.log('WARN >', ...info);
	}
	info(...info: any[]) {
		if (this.loglevel >= this.LOGLEVEL_INFO) console.log('INFO >', ...info);
	}
	debug(...info: any[]) {
		if (this.loglevel >= this.LOGLEVEL_DEBUG) console.log('DEBUG>', ...info);
	}
	detail(...info: any[]) {
		if (this.loglevel >= this.LOGLEVEL_DETAIL) console.log('DETAL>', ...info);
	}
	logKey(...info: any[]) {
		if (this.loglevel >= this.LOGLEVEL_KEY) console.log('KEY>', ...info);
	}

	scrLog(msg: string, staytime = 5000) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const parent = $('#MSG').parent();
		const msgDIV = $('#MSG');
		let cloneDIV = $('#fadeoutmsg');
		if (cloneDIV.length > 0) {
			if (that.msgTimer) {
				clearTimeout(that.msgTimer);
				that.msgTimer = undefined;
			}
			cloneDIV.remove();
		}
		cloneDIV = msgDIV.clone().appendTo(parent);
		cloneDIV.removeClass('noshow');
		cloneDIV.attr('id', 'fadeoutmsg');
		cloneDIV.html(msg);
		that.msgTimer = setTimeout(() => {
			cloneDIV.animate(
				{
					opacity: 0
				},
				500,
				async function () {
					cloneDIV.remove();
				}
			);
		}, staytime);
	}

	calculateNodeConnectPoints(jqDIV: myJQuery) {
		const divLeft = KFKclass.unpx(jqDIV.css('left'));
		const divTop = KFKclass.unpx(jqDIV.css('top'));
		const divWidth = KFKclass.unpx(jqDIV.css('width'));
		const divHeight = KFKclass.unpx(jqDIV.css('height'));

		const pos = {
			center: {
				x: divLeft + divWidth * 0.5,
				y: divTop + divHeight * 0.5
			},
			points: [
				{
					x: divLeft,
					y: divTop + divHeight * 0.5
				},
				{
					x: divLeft + divWidth * 0.5,
					y: divTop
				},
				{
					x: divLeft + divWidth,
					y: divTop + divHeight * 0.5
				},
				{
					x: divLeft + divWidth * 0.5,
					y: divTop + divHeight
				}
			]
		};
		return pos;
	}

	//eslint-disable-next-line
	async drawConnect(
		A: myJQuery,
		B: myJQuery,
		caseValue: string,
		setValue: string,
		_posLimitA = [0, 1, 2, 3], //eslint-disable-line
		_posLimitB = [0, 1, 2, 3], //eslint-disable-line
		drawLine = true
	) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const APos = that.calculateNodeConnectPoints(A);
		const BPos = that.calculateNodeConnectPoints(B);
		let AIndex = 0;
		let BIndex = 0;
		/*
  //找两个节点的4个连接点中，连接距离最短的两个连接点，一个属于from节点，一个属于to节点
  let shortestDistance = that.distance(APos.points[0], BPos.points[0]);
  for (let i = 0; i < APos.points.length; i++) {
    if (posLimitA.indexOf(i) < 0) continue;
    fromPoint = APos.points[i];
    for (let j = 0; j < BPos.points.length; j++) {
      if (posLimitB.indexOf(j) < 0) continue;
      toPoint = BPos.points[j];
      let tmp_drawConnect_distance = that.distance(fromPoint, toPoint);
      if (tmp_drawConnect_distance < shortestDistance) {
        shortestDistance = tmp_drawConnect_distance;
        AIndex = i;
        BIndex = j;
      }
    }
  }
  */

		if (APos.points[0].x > BPos.points[2].x) {
			AIndex = 0;
			BIndex = 2;
		} else if (APos.points[2].x < BPos.points[0].x) {
			AIndex = 2;
			BIndex = 0;
		} else if (APos.points[1].y > BPos.points[3].y) {
			/*
    if (APos.points[2].x < BPos.points[1].x) {
      AIndex = 2;
      BIndex = 3;
    } else if (APos.points[0].x > BPos.points[1].x) {
      AIndex = 0;
      BIndex = 3;
    } else {
      AIndex = 1;
      BIndex = 3;
    }
    */
			AIndex = 1;
			BIndex = 3;
		} else if (APos.points[3].y < BPos.points[1].y) {
			/*
    if (APos.points[2].x < BPos.points[1].x) {
      AIndex = 2;
      BIndex = 1;
    } else if (APos.points[0].x > BPos.points[1].x) {
      AIndex = 0;
      BIndex = 1;
    } else {
      AIndex = 3;
      BIndex = 1;
    }
    */
			AIndex = 3;
			BIndex = 1;
		} else {
			// 不画线
			AIndex = 0;
			BIndex = -1;
		}

		if (drawLine && BIndex >= 0) {
			//只有当BIndex>=0时画线
			await that.svgConnectNode(
				A.attr('id'),
				B.attr('id'),
				AIndex,
				BIndex,
				APos.points[AIndex].x,
				APos.points[AIndex].y,
				BPos.points[BIndex].x,
				BPos.points[BIndex].y,
				caseValue,
				setValue
			);
		}
		return [AIndex, BIndex];
	}

	async yarkLinkNode(jqDIV: myJQuery, altKey: boolean = false) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.shapeDragging) return;
		if (that.nodeLocked(jqDIV)) return;
		if (that.linkPosNode.length === 0) {
			if (that.connectEndFirst === false) {
				if (jqDIV.hasClass('END') || jqDIV.hasClass('GROUND')) return;
			} else {
				if (jqDIV.hasClass('START')) return;
			}
		}
		if (that.linkPosNode.length > 0) {
			if (that.connectEndFirst === false) {
				if (jqDIV.hasClass('START')) return;
			} else {
				if (jqDIV.hasClass('END') || jqDIV.hasClass('GROUND')) return;
			}
		}
		that.tmpPos = that.calculateNodeConnectPoints(jqDIV);
		that.linkPosNode.push(jqDIV);
		await that.procLinkNode(altKey);
	}

	cancelLinkNode() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.linkPosNode.length > 0) {
			that.cancelTempLine();
			that.linkPosNode.splice(0, 2);
		} else {
			that.setTool('POINTER');
		}
	}

	//add link add connection lianjie lianxian
	async procLinkNode(altKey: boolean) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.linkPosNode.length < 2) {
			//if A is END or GROUND, remove it
			if (that.connectEndFirst === false) {
				if (that.linkPosNode[0].hasClass('END') || that.linkPosNode[0].hasClass('GROUND'))
					that.linkPosNode.splice(0, 1);
				else that.showNodeMessage(that.linkPosNode[0], 'A->B,  pick B please');
			} else {
				if (that.linkPosNode[0].hasClass('START')) that.linkPosNode.splice(0, 1);
				else that.showNodeMessage(that.linkPosNode[0], 'B<-A, pick A please ');
			}
			return;
		} else {
			// two nodes are ready
			if (that.linkPosNode[0].attr('id') === that.linkPosNode[1].attr('id')) {
				//If A,B are the same node, remove B
				that.linkPosNode.splice(1, 1);
				return;
			} else if (
				(that.connectEndFirst === false && that.linkPosNode[1].hasClass('START')) ||
				(that.connectEndFirst === true &&
					(that.linkPosNode[1].hasClass('END') || that.linkPosNode[1].hasClass('GROUND')))
			) {
				//If B is START, remove B , connectEndFirst === false
				//If B is END or GROUND, remove B , connectEndFirst === true
				that.linkPosNode.splice(1, 1);
				return;
			} else if (
				(that.connectEndFirst === false &&
					that.linkPosNode[0].hasClass('START') &&
					that.linkPosNode[1].hasClass('END')) ||
				(that.connectEndFirst === true &&
					that.linkPosNode[0].hasClass('END') &&
					that.linkPosNode[1].hasClass('START'))
			) {
				that.linkPosNode.splice(0, 2);
				that.movingConnect = false;
				that.connectEndFirst = false;
				that.tobeRemovedConnectId = null;
				that.cancelTempLine();
				that.clearNodeMessage();
				return;
			}
		}
		if (that.tempSvgLine) that.tempSvgLine.hide();
		that.lineTemping = false;
		that.cancelAlreadySelected();
		that.clearNodeMessage();
		if (that.tobeRemovedConnectId) {
			that.clipboardConnectText = $(`.${that.tobeRemovedConnectId}`).attr('case');
			await that.removeConnectById(that.tobeRemovedConnectId);
			that.tobeRemovedConnectId = null;
			that.setTool('POINTER');
			that.movingConnect = false;
		}
		let newConnectId = null;
		if (that.connectEndFirst === false) {
			that.buildConnectionBetween(that.linkPosNode[0], that.linkPosNode[1]);
			newConnectId = `connect_${that.linkPosNode[0].attr('id')}_${that.linkPosNode[1].attr('id')}`;
			await that.redrawLinkLines(that.linkPosNode[0], 'connect');
		} else {
			that.buildConnectionBetween(that.linkPosNode[1], that.linkPosNode[0]);
			newConnectId = `connect_${that.linkPosNode[1].attr('id')}_${that.linkPosNode[0].attr('id')}`;
			await that.redrawLinkLines(that.linkPosNode[1], 'connect');
		}
		if (
			that.clipboardConnectText &&
			that.clipboardConnectText.trim().length > 0 &&
			that.movingEnd
		) {
			that.setConnectText($(`.${newConnectId}`), that.clipboardConnectText);
			console.log('Movingend', that.movingEnd);
			if (that.movingEnd) that.movingEnd = false;
		}
		//看两个节点的Linkto属性，在添加一个连接线后有没有什么变化，
		//如果有变化，就上传U， 如果没变化，就不用U
		//没有变化的情况：之前就有从linkPosNode[0]到 linkPosNode[1]的链接存在
		//有变化的情况：1. 之前不存在； 2. 之前存在方向相反的链接，从linkPosNode[1]到linkPosNode[0]的
		//以上两种情况中，1会只导致只U第一个； 2会导致U；两端两个节点

		if (!altKey || that.connectEndFirst === true) {
			//如果没有按住Shift，则结束连接操作
			that.linkPosNode.splice(0, 2);
		} else {
			//如果按住Shift，
			//如果连接到的对象是END或GROUND
			if (that.linkPosNode[1].hasClass('END') || that.linkPosNode[1].hasClass('GROUND')) {
				//则从出发点继续连接其他节点
				that.tmpPos = that.calculateNodeConnectPoints(that.linkPosNode[0]);
				that.linkPosNode.splice(1, 1);
			} else {
				//如果结束点不是END或GROUND，则把结束点作为出发点，继续连接
				that.linkPosNode[0] = that.linkPosNode[1];
				that.linkPosNode.splice(1, 1);
			}
		}
		if (that.connectEndFirst === true) that.connectEndFirst = false;
		that.onChange('Connect');
	}

	clearNodeMessage() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.nodeMessageTimer) {
			clearTimeout(that.nodeMessageTimer);
		}
		$('.nodeMessage').remove();
	}
	showNodeMessage(jqDiv: JQuery<HTMLElement>, msg: string, lastSec = 3) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.APP.model.viewConfig.nodemessage === false) return;
		if (that.nodeMessageTimer) {
			clearTimeout(that.nodeMessageTimer);
			$('.nodeMessage').remove();
		}
		const msgDiv = $('<div></div>');
		msgDiv.addClass('nodeMessage');
		msgDiv.appendTo(jqDiv);
		msgDiv.prop('innerHTML', msg);
		that.nodeMessageTimer = setTimeout(() => {
			msgDiv.remove();
			that.nodeMessageTimer = undefined;
		}, lastSec * 1000);
	}

	setShapeToRemember(theShape: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.shapeToRemember = theShape.clone();
		that.shapeToRemember.attr('id', theShape.attr('id'));
		that.shapeToRemember.attr('stroke-width', theShape.attr('origin-width'));
	}

	//shape event
	addShapeEventListner(theShape: any): void {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		//mouseover shape
		theShape.on('mouseover', (evt: MouseEvent) => {
			if (that.shapeDragging || that.isFreeHandDrawing) return;
			that.hoverSvgLine(theShape);
			const color = theShape.attr('origin-color');
			that.shapeOriginColor = color;
			const color1 = that.reverseColor(color);
			that.onC3 = true;
			const originWidth = theShape.attr('origin-width');
			const newWidth =
				originWidth * 2 > that.CONST.MAX_SHAPE_WIDTH ? originWidth : that.CONST.MAX_SHAPE_WIDTH;
			if (theShape.hasClass('selected') === false) {
				theShape.stroke({
					width: newWidth,
					color: color1
				});
			}
			if (that.lineLocked(theShape)) {
				KFKclass.hide($('#linetransformer'));
				return;
			}

			$(document.body).css('cursor', 'pointer');
			if (theShape.array && theShape.hasClass('kfkline')) {
				const parr = theShape.array();
				if (
					KFKclass.mouseNear(
						that.C3MousePos(evt),
						{
							x: parr[0][0],
							y: parr[0][1]
						},
						20
					)
				) {
					KFKclass.show('#linetransformer');
					that.moveLinePoint = 'from';
					that.lineToResize = theShape;
					that.setShapeToRemember(theShape);
					that.moveLineMoverTo(
						that.jc3PosToJc1Pos({
							x: parr[0][0],
							y: parr[0][1]
						})
					);
				} else if (
					KFKclass.mouseNear(
						that.C3MousePos(evt),
						{
							x: parr[1][0],
							y: parr[1][1]
						},
						20
					)
				) {
					KFKclass.show('#linetransformer');
					that.moveLinePoint = 'to';
					that.lineToResize = theShape;
					that.setShapeToRemember(theShape);
					that.moveLineMoverTo(
						that.jc3PosToJc1Pos({
							x: parr[1][0],
							y: parr[1][1]
						})
					);
				} else {
					KFKclass.hide('#linetransformer');
				}
			}
		});
		//mouseout shape
		theShape.on('mouseout', () => {
			if (that.shapeDragging === false) {
				that.hoverSvgLine(null);
				$(document.body).css('cursor', 'default');
				if (theShape.hasClass('selected') === false) {
					theShape.stroke({
						width: theShape.attr('origin-width'),
						color: theShape.attr('origin-color')
					});
				}
			}
		});
		theShape.on('mousedown', (evt: MouseEvent) => {
			//that.closeActionLog();
			if (that.tool === 'lock') {
				//that.tryToLockUnlock(evt.shiftKey);
				return;
			}

			that.mousePosToRemember = {
				x: that.currentMousePos.x,
				y: that.currentMousePos.y
			};
			//begin shape zoom, begin zoom shape
			if (evt.ctrlKey || evt.metaKey) {
				that.isZoomingShape = true;
				//这里必须重新plot一遍，否则，在zoom时会出错
				if (theShape.array) {
					const arr = theShape.array();
					theShape = theShape.plot(arr);
				}
				that.shapeToZoom = theShape;
				that.setShapeToRemember(theShape);
				that.shapeSizeCenter = {
					x: that.scalePoint(theShape.cx()),
					y: that.scalePoint(theShape.cy())
				};
				that.shapeSizeOrigin = {
					w: theShape.width(),
					h: theShape.height()
				};
				that.shapeZoomStartPoint = {
					x: that.scalePoint(that.scrXToJc3X(evt.clientX)),
					y: that.scalePoint(that.scrYToJc3Y(evt.clientY))
				};
				//let dis = that.distance(that.shapeSizeCenter, that.shapeZoomStartPoint);
			} else {
				//begin drag shape, begin shape drag
				that.isZoomingShape = false;
				that.shapeToDrag = theShape;
				that.setShapeToRemember(theShape);
				that.shapeDraggingStartPoint = {
					x: that.scalePoint(that.scrXToJc3X(evt.clientX)),
					y: that.scalePoint(that.scrYToJc3Y(evt.clientY))
				};
				that.shapeFirstDraggingStartPoint = {
					x: that.scalePoint(that.scrXToJc3X(evt.clientX)),
					y: that.scalePoint(that.scrYToJc3Y(evt.clientY))
				};
			}
		});
		//click line click shape click connection click connect
		theShape.on('click', (evt: MouseEvent) => {
			evt.stopImmediatePropagation();
			evt.stopPropagation();
			evt.preventDefault();
			that.hoverSvgLine(theShape);
			if (that.anyLocked(theShape)) return;
			// if (that.firstShown['right'] === false && that.docIsNotReadOnly()) {
			// KFKclass.show('#right');
			// that.firstShown['right'] = true;
			// }
			// that.shapeToDrag = null;
			that.focusOnNode(null);
			that.APP.setData('show', 'shape_property', true);
			that.APP.setData('show', 'customshape', false);
			that.APP.setData('show', 'customline', true);
			that.APP.setData('show', 'custombacksvg', false);
			that.APP.setData('show', 'customfont', false);
			that.APP.setData('show', 'layercontrol', false);

			that.setShapeToRemember(theShape);
			that.selectShape(theShape);

			that.pickedShape = theShape;
			const color = theShape.attr('origin-color');
			const width = theShape.attr('origin-width');
			const linecap = theShape.attr('stroke-linecap');
			//$('#lineColor').spectrum('set', that.shapeOriginColor);
			$('#spinner_line_width').spinner('value', width);
			const lineSetting = {
				color: color,
				width: width,
				linecap: linecap === 'round' ? true : false
			};
			that.APP.setData('model', 'line', lineSetting);
		});
	}

	addLinkTo(jq1: myJQuery, jq2: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const id1 = jq1.attr('id');
		const id2 = jq2.attr('id');
		const filter = `.link[from="${id1}"][to="${id2}"]`;
		const links = that.tpl.find(filter);
		if (links.length > 0) {
			return;
		} else {
			that.tpl.append(`<div class="link" from="${id1}" to="${id2}"></div>`);
		}
	}
	/**
	 * 断掉两个节点之间的连接
	 * @param jq 连接的from节点
	 * @param idToRemove 连接的to节点的id
	 */
	removeLinkTo(jq: myJQuery, idToRemove: string) {
		const str = jq.attr('linkto');
		const arr = KFKclass.stringToArray(str);
		//如对手节点在反方向存在，就把反方向的对手节点去掉
		const index = arr.indexOf(idToRemove);
		if (index >= 0) {
			arr.splice(index, 1);
			if (arr.length > 0) jq.attr('linkto', arr.join(','));
			else jq.removeAttr('linkto');
		}
	}
	buildConnectionBetween(jq1: myJQuery, jq2: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.addLinkTo(jq1, jq2);
		that.removeLinkTo(jq2, jq1.attr('id'));
	}

	/**
	 * 获得一个节点的所有父节点
	 * @param jq 子节点
	 * @return 一个包含所有父节点的数组
	 */
	getParent(jq: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const ret = [];
		const myId = jq.attr('id');
		that.JC3.find('.kfknode').each((_index: any, aNode: any) => {
			const jqConnectFrom = $(aNode);
			if (jqConnectFrom.attr('id') !== myId) {
				const arr = KFKclass.stringToArray(jqConnectFrom.attr('linkto'));
				if (arr.indexOf(myId) >= 0) ret.push(jqConnectFrom);
			}
		});
		return ret;
	}

	/**
	 * 两个节点之间是否有连接？
	 * @param jq1  from节点
	 * @param jq2  to节点
	 */
	hasConnection(jq1: myJQuery, jq2: myJQuery) {
		const str = jq1.attr('linkto');
		if (KFKclass.NotSet(str)) return false;
		const arr = KFKclass.stringToArray(str);

		let linkToId = '';
		if (typeof jq2 === 'string') {
			linkToId = jq2;
		} else {
			linkToId = jq2.attr('id');
		}

		const index = arr.indexOf(linkToId);
		return index >= 0;
	}

	distance(p1: Point, p2: Point) {
		return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
	}

	getZIndex(jqDiv: myJQuery) {
		let zz = parseInt(jqDiv.css('z-index'));
		zz = isNaN(zz) ? 0 : zz;
		return zz;
	}
	setZIndex(jqDiv: myJQuery, zz: any) {
		jqDiv.css('z-index', zz);
	}
	//unselect all, deselect all
	cancelAlreadySelected() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		while (that.selectedDIVs.length > 0) {
			that.deselectNode(that.selectedDIVs[0]);
		}
		that.selectedDIVs = [];

		while (that.selectedConnects.length > 0) {
			that.deselectConnect(that.selectedConnects[0]);
		}
		that.selectedConnects = [];
		that.focusOnNode(null);
	}

	getLineIdFromString(str: string) {
		const m = str.match(/id\s*=\s*('|")([^"]+)('|")/);
		if (m) {
			return m[2];
		} else return null;
	}

	async changeId(oldId, newId) {
		let that = this;
		console.log(oldId, newId);
		let jqDIV = that.JC3.find(`#${oldId}`);
		jqDIV.attr('id', newId);
		jqDIV.find(`.nodeidlabel`).text(newId);
		let connectsFromThis = that.JC3.find(`.connect[fid="${oldId}"]`);
		for (let i = 0; i < connectsFromThis.length; i++) {
			let jqC = $(connectsFromThis[i]);
			let toId = jqC.attr('tid');
			let oldClass = `connect_${oldId}_${toId}`;
			let newClass = `connect_${newId}_${toId}`;
			jqC.attr('id', newClass);
			jqC.removeClass(oldClass).addClass(newClass);
			jqC.attr('fid', newId);
			let oldTriClass = `${oldClass}_triangle`;
			let newTriClass = `${newClass}_triangle`;
			that.JC3.find(`.${oldTriClass}`).removeClass(oldTriClass).addClass(newTriClass);

			let oldTextClass = `${oldClass}_text`;
			let newTextClass = `${newClass}_text`;
			that.JC3.find(`.${oldTextClass}`).removeClass(oldTextClass).addClass(newTextClass);
		}
		let connectsToThis = that.JC3.find(`.connect[tid="${oldId}"]`);
		for (let i = 0; i < connectsToThis.length; i++) {
			let jqC = $(connectsToThis[i]);
			let fromId = jqC.attr('fid');
			let oldClass = `connect_${fromId}_${oldId}`;
			let newClass = `connect_${fromId}_${newId}`;
			jqC.attr('id', newClass);
			jqC.removeClass(oldClass).addClass(newClass);
			jqC.attr('tid', newId);
			let oldTriClass = `${oldClass}_triangle`;
			let newTriClass = `${newClass}_triangle`;
			that.JC3.find(`.${oldTriClass}`).removeClass(oldTriClass).addClass(newTriClass);

			let oldTextClass = `${oldClass}_text`;
			let newTextClass = `${newClass}_text`;
			that.JC3.find(`.${oldTextClass}`).removeClass(oldTextClass).addClass(newTextClass);
		}
		let tplLinks = that.tpl.find(`.link[from="${oldId}"]`);
		for (let i = 0; i < tplLinks.length; i++) {
			$(tplLinks[i]).attr('from', newId);
		}
		tplLinks = that.tpl.find(`.link[to="${oldId}"]`);
		for (let i = 0; i < tplLinks.length; i++) {
			$(tplLinks[i]).attr('to', newId);
		}
		that.redrawLinkLines(jqDIV, 'change ID', 'both');
		that.onChange('change ID');
	}

	async setNodeEventHandler(jqNodeDIV: myJQuery, callback?: any, setDrag = true) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		//drag node
		try {
			const click = {
				x: 0,
				y: 0
			};
			jqNodeDIV.off('mouseover mouseout');
			jqNodeDIV.on('mouseover', async () => {
				await that.driveNodeBalls(jqNodeDIV);
			});
			jqNodeDIV.on('mouseout', async () => {
				await that.stopNodeBalls();
			});
			if (setDrag) {
				jqNodeDIV.draggable({
					scroll: true,
					containment: 'parent',
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					start: (evt: MouseEvent, _ui: any) => {
						that.stopNodeBalls();
						click.x = evt.clientX;
						click.y = evt.clientY;
						that.fromJQ = jqNodeDIV.clone();
						evt.stopImmediatePropagation();
						evt.stopPropagation();
						that.originZIndex = that.getZIndex(jqNodeDIV);
						jqNodeDIV.css('z-index', '99999');
						that.dragging = true;
						that.positionBeforeDrag = {
							x: that.divLeft(jqNodeDIV),
							y: that.divTop(jqNodeDIV)
						};
					},
					drag: (
						evt: MouseEvent,
						ui: { originalPosition: any; position: { left: number; top: number } }
					) => {
						const original = ui.originalPosition;

						// jQuery will simply use the same object we alter here
						ui.position = {
							left: (evt.clientX - click.x + original.left) / that.scaleRatio,
							top: (evt.clientY - click.y + original.top) / that.scaleRatio
						};
					},
					stop: async (evt: MouseEvent) => {
						that.dragging = false;
						await that.stopNodeBalls();

						//如果做了这个标记，则不再做U操作，否则，节点又会被同步回来
						/*
						if (jqNodeDIV.shouldBeDeleted === true) {
							return;
						}
						*/
						if (that.updateable(jqNodeDIV) === false) {
							return;
						}
						if (that.APP.model.viewConfig.snap) {
							const newPos = that.DivStyler.snapToGrid(jqNodeDIV);
							that.DivStyler.moveDivTo(jqNodeDIV, newPos.x, newPos.y);
						}
						if (that.AdvOps.existsInGroup(that.selectedDIVs, jqNodeDIV) === false) {
							that.cancelAlreadySelected();
						}
						that.startTrx();
						try {
							const deltaOfDragging = {
								x: that.divLeft(jqNodeDIV) - that.positionBeforeDrag.x,
								y: that.divTop(jqNodeDIV) - that.positionBeforeDrag.y
							};

							const tobeMovedNodes = [];
							//如果按住了shiftkey, 则只移动当前node, 不移动其他被选定Node
							//move nodes, move divs, drag divs end, end drag divs
							// dragend drag end
							if (!evt.shiftKey) {
								//拖动其它被同时选中的对象
								that.shouldMovedInParalles = [];
								const treeMap = new Map();
								for (let i = 0; i < that.selectedDIVs.length; i++) {
									if (that.selectedDIVs[i].attr('id') !== jqNodeDIV.attr('id')) {
										that.shouldMovedInParalles.push(that.selectedDIVs[i]);
									}
								}

								for (let i = 0; i < that.selectedDIVs.length; i++) {
									await that.AdvOps.getDescendants(
										that.selectedDIVs[i],
										that.selectedDIVs[i],
										that.shouldMovedInParalles,
										treeMap
									);
								}

								if (that.shouldMovedInParalles.length > 0) {
									//要移动的个数是被选中的全部
									for (let i = 0; i < that.shouldMovedInParalles.length; i++) {
										//虽然这出跳过了被拖动的节点，但在后面这个节点一样要被移动
										//因此，所有被移动的节点数量就是所有被选中的节点数量
										if (that.updateable(that.shouldMovedInParalles[i])) {
											const tmp = that.shouldMovedInParalles[i].clone();
											that.DivStyler.moveDivByDelta(
												that.shouldMovedInParalles[i],
												deltaOfDragging.x,
												deltaOfDragging.y
											);
											tobeMovedNodes.push({
												from: tmp,
												to: that.shouldMovedInParalles[i]
											});
										}
									}
									for (let i = 0; i < that.shouldMovedInParalles.length; i++) {
										await that.redrawLinkLines(that.shouldMovedInParalles[i], 'codrag', 'both');
									}
								}
							}

							that.afterDragging = true;
							jqNodeDIV.css('z-index', that.originZIndex);
							that.originZIndex = 1;
							//节点移动后，对连接到节点上的连接线重新划线
							await that.redrawLinkLines(jqNodeDIV, 'after moving', 'both');
							that.setSelectedNodesBoundingRect();

							tobeMovedNodes.push({
								from: that.fromJQ,
								to: jqNodeDIV
							});
						} finally {
							that.yarkOpHistory({
								obj: 'node',
								from: that.fromJQ.clone(),
								to: jqNodeDIV.clone()
							});
							that.onChange('Dragged');
							that.focusOnNode(jqNodeDIV);
							that.endTrx();
						}
					}
				});
			}
		} catch (error) {
			console.error(error);
		}

		try {
			jqNodeDIV.hover(
				() => {
					$(document.body).css('cursor', 'pointer');
					that.hoverJqDiv(jqNodeDIV);
					that.onC3 = true;
				},
				() => {
					$(document.body).css('cursor', 'default');
					// jqNodeDIV.resizable('disable');
					that.hoverJqDiv(null);
					that.onC3 = true;
				}
			);
		} catch (error) {
			console.error(error);
		}

		try {
			//防止点在节点上，以后，画出框选框
			jqNodeDIV.mousedown((evt: MouseEvent) => {
				evt.stopImmediatePropagation();
				evt.stopPropagation();
			});
		} catch (error) {
			console.error(error);
		}
		//click node
		//click on node
		try {
			jqNodeDIV.click(async (evt: MouseEvent) => {
				KFKclass.hide($('.clickOuterToHide'));
				/*
			if (that.edittingJQ) {
				await that.handleOutsideClick(evt);
			}
			*/

				that.pickedShape = null;
				that.afterDragging = false;
				that.afterResizing = false;
				evt.stopImmediatePropagation();
				evt.stopPropagation();
				that.focusOnNode(jqNodeDIV);
				await that.onClickNode(evt, jqNodeDIV);
			});
		} catch (error) {
			console.error(error);
		}

		if (callback) await callback();
	}

	/* async undo() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.opz < 0) {
			return;
		}
		const pair = that.opstack[that.opz];
		if (pair.obj === 'node') {
			if (pair.from !== null && pair.to !== null) {
				const nodeId = pair.to.attr('id');
				let jqNode = that.JC3.find(`#${nodeId}`);
				jqNode.prop('outerHTML', pair.from.prop('outerHTML'));
				jqNode = that.JC3.find(`#${nodeId}`);
				//that.addSvgLayer();
				await that.setNodeEventHandler(jqNode);
				await that.redrawLinkLines(jqNode, 'undo', 'both');
			} else if (pair.from === null && pair.to !== null) {
				//A create
				const nodeId = pair.to.attr('id');
				const jqNode = that.JC3.find(`#${nodeId}`);
				await that.cleanUpConnection(jqNode, true);
				jqNode.remove();
			} else if (pair.from !== null && pair.to === null) {
				//A delete
				const nodeId = pair.from.attr('id');
				that.JC3.append(pair.from);
				const jqNode = that.JC3.find(`#${nodeId}`);
				await that.setNodeEventHandler(jqNode);
				await that.redrawLinkLines(jqNode, 'undo', 'both');
			}
		} else if (pair.obj === 'link') {
			//对连接的操作
			if (pair.from !== null && pair.to === null) {
				const fromNodeId = pair.from.attr('from');
				//let toNodeId = pair.from.attr('to');
				const jqFrom = that.JC3.find(`#${fromNodeId}`);
				if (jqFrom && jqFrom.length > 0) {
					await that.tpl.append(pair.from);
					await that.redrawLinkLines(jqFrom, 'undo');
				}
			}
		}
		that.opz = that.opz - 1;
		that.onChange('Undo');
	} */

	async undo() {
		const that = this;
		if (history_pointer - 2 >= 0) {
			that.template.doc = history[history_pointer - 2];
			history_pointer--;
			await that.resetTemplateDoc();
			that.designerCallback('setTemplate', that.template);
			that.onChange('UNDO');
		}
	}
	async redo() {
		const that = this;
		if (history_pointer < history.length) {
			that.template.doc = history[history_pointer];
			history_pointer++;
			await that.resetTemplateDoc();
			that.designerCallback('setTemplate', that.template);
			that.onChange('REDO');
		}
	}

	async resetTemplateDoc() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		await that.cleanupJC3();
		//that.tmpBalls.clear();
		//that.template = template;
		//that.workflow = null;
		//that.tpl_mode = tplmode;
		/* if (that.tpl_mode === 'read') {
			that.setTool('POINTER');
		} */
		try {
			//that.tplid = that.template.tplid;
			that.tpl = $(that.template.doc);
			const nodes = that.tpl.find('.node');
			nodes.addClass('kfknode');
			await that.JC3.append(nodes);
			const guiNodes = that.JC3.find('.node');
			for (let i = 0; i < guiNodes.length; i++) {
				const jqNode = $(guiNodes[i]);
				await that.setNodeEventHandler(jqNode);
				if (that.docIsReadOnly()) {
					jqNode.draggable('disable');
				} else {
					jqNode.draggable('enable');
				}
				await that.redrawLinkLines(jqNode, 'loadTemplateDoc');
			}

			if (that.docIsNotReadOnly()) {
				$('#linetransformer').draggable('enable');
			} else {
				$('#linetransformer').draggable('disable');
			}
			/* that.myFadeOut($('.loading'));
			that.myFadeIn(that.JC3, 1000);
			$('#overallbackground').removeClass('grid1');
			that.focusOnC3();
			that.scrollToLastPosition(that.tplid);
			that.C3.dispatchEvent(that.refreshC3Event); */

			/*
			KFKclass.show(that.JC3);
			if (that.docIsReadOnly()) {
				$('#leftPanel').addClass('noshow');
				$('#minimap').addClass('noshow');
				that.myFadeOut($('#leftPanel'), 500);
			} else {
				$('#leftPanel').removeClass('noshow');
				$('#minimap').removeClass('noshow');
				that.myFadeIn($('#leftPanel'), 1000);
			}
			 */
		} catch (err) {
			console.error(err);
		} finally {
			//that.addDocumentEventHandler();
			//that.inited = true;
			that.showHelp('Undo one step', 10000);
		}
	}

	/* async redo() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.opz >= that.opstack.length - 1) {
			return;
		}
		that.opz = that.opz + 1;
		const pair = that.opstack[that.opz];
		//对节点的操作
		if (pair.obj === 'node') {
			if (pair.from !== null && pair.to !== null) {
				const nodeId = pair.to.attr('id');
				let jqNode = that.JC3.find(`#${nodeId}`);
				jqNode.prop('outerHTML', pair.to.prop('outerHTML'));
				jqNode = that.JC3.find(`#${nodeId}`);
				await that.setNodeEventHandler(jqNode);
				await that.redrawLinkLines(jqNode, 'redo', 'both');
			} else if (pair.from === null && pair.to !== null) {
				const nodeId = pair.to.attr('id');
				that.JC3.append(pair.to);
				const jqNode = that.JC3.find(`#${nodeId}`);
				await that.setNodeEventHandler(jqNode);
				await that.redrawLinkLines(jqNode, 'redo', 'both');
			} else if (pair.from !== null && pair.to === null) {
				const nodeId = pair.from.attr('id');
				const jqNode = that.JC3.find(`#${nodeId}`);
				await that.cleanUpConnection(jqNode, true);
				jqNode.remove();
			}
		} else if (pair.obj === 'link') {
			//对连接的操作
			if (pair.from !== null && pair.to === null) {
				const fromNodeId = pair.from.attr('from');
				const toNodeId = pair.from.attr('to');
				const connectId = `connect_${fromNodeId}_${toNodeId}`;
				await that.removeConnectById(connectId);
			}
		}
		that.onChange('Redo');
	} */

	initLayout() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.JC1 = $('#C1');
		that.C1 = el(that.JC1);
		that.JS1 = $('#S1');
		that.S1 = el(that.JS1);
		that.JC1.css({
			width: KFKclass.px(that.PageWidth * (that.PageNumberHori + 2)),
			height: KFKclass.px(that.PageHeight * (that.PageNumberVert + 2))
		});
	}

	async placeNodeOnClick(evt: MouseEvent) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.isEditting || that.resizing || that.dragging) {
			return;
		}
		evt.preventDefault();
		KFKclass.hide($('.clickOuterToHide'));
		if (that.ignoreClick) return;

		// that.focusOnNode(null);
		that.justCreatedJqNode = null;
		that.justCreatedShape = null;

		that.pickedShape = null;

		// if (that.tool === 'lock' || that.tool === 'connect') {
		//   that.setTool('POINTER');
		// }
		if (that.docIsReadOnly()) return;

		if (that.tobeTransformJqLine) that.tobeTransformJqLine.removeClass('shadow2');
		KFKclass.hide('#linetransformer');
		that.tobeTransformJqLine = null;

		if (that.afterDragging === true) {
			that.afterDragging = false;
			// return;
		}
		if (that.afterResizing === true) {
			that.afterResizing = false;
			// return;
		}

		if (
			that.selectedDIVs.length > 0 ||
			that.selectedShapes.length > 0 ||
			that.selectedConnects.length > 0
		) {
			if (that.duringKuangXuan === false) that.cancelAlreadySelected();
		}
		if (cocoConfig.node[that.tool]) {
			const variant = 'default';
			const realX = that.scalePoint(that.scrXToJc3X(evt.clientX));
			const realY = that.scalePoint(that.scrYToJc3Y(evt.clientY));
			const jqDIV = await that.placeNode(
				evt.shiftKey,
				that.myuid(),
				that.tool,
				variant,
				realX,
				realY,
				undefined,
				undefined,
				'',
				''
			);
			that.addMobileHandler([jqDIV]);
			that.addNodeIdDIV([jqDIV]);
			that.focusOnNode(jqDIV);
			that.yarkOpHistory({
				obj: 'node',
				from: null,
				to: jqDIV.clone()
			});
			that.onChange('New Node');
		}

		evt.stopImmediatePropagation();
		evt.stopPropagation();
		evt.preventDefault();
	}

	//create C3 create c3
	initC3() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.JC3 = $('#C3');
		that.C3 = el(that.JC3);
		that.JC3.css({
			width: KFKclass.px(that.PageWidth * that.PageNumberHori),
			height: KFKclass.px(that.PageHeight * that.PageNumberVert),
			left: KFKclass.px(that.LeftB),
			top: KFKclass.px(that.TopB)
		});
		that.JCBKG = $('#containerbkg');
		that.JCBKG.css({
			width: KFKclass.px(that.PageWidth * that.PageNumberHori),
			height: KFKclass.px(that.PageHeight * that.PageNumberVert),
			left: KFKclass.px(that.LeftB),
			top: KFKclass.px(that.TopB)
		});

		that.JC3.dblclick(async function (evt: MouseEvent) {
			/* if (that.isEditting && that.inlineEditor) {
				that.endInlineEditing();
			} */
			if (that.isEditting || that.resizing || that.dragging) {
				return;
			}
			/*
			if (that.inOverviewMode === true) {
				that.toggleOverview({
					x: evt.offsetX,
					y: evt.offsetY
				});
			} else if (that.tool === 'POINTER') {
				that.toggleOverview();
			}
			*/
			that.cancelTempLine();
			evt.preventDefault();
			evt.stopImmediatePropagation();
			evt.stopPropagation();
		});
		that.JC1.on('contextmenu', function (evt: Event) {
			evt.preventDefault();
			that.kuangXuanMouseIsDown = false;
		});
		that.JC1.on('click', async function () {
			if (KFKclass.IsSet(that.selectedTodo)) {
				that.selectedTodo.removeClass('current');
			}
			that.kuangXuanMouseIsDown = false;
			KFKclass.hide($('.clickOuterToHide'));
		});
		//click c3
		that.JC3.on('contextmenu', function (evt: MouseEvent) {
			evt.preventDefault();
			evt.stopPropagation();
			that.kuangXuanMouseIsDown = false;
			if (that.ctrlMouseToPan === true) {
				that.panStartAt = {
					x: evt.clientX,
					y: evt.clientY
				};
			}
		});
		that.JC3.on('click', async function (evt: MouseEvent) {
			if (evt.ctrlKey) {
				evt.stopPropagation();
				evt.preventDefault();
				return;
			}
			that.focusOnNode(null);

			const tmpPoint = {
				x: evt.clientX,
				y: evt.clientY
			};
			//that.pointAfterResize 记录着DIV重新拖动大小后，释放鼠标的一霎那间的鼠标位置
			//这样，在鼠标释放同时，click事件发起时，下面的代码避免执行
			if (that.pointAfterResize) {
				if (that.distance(tmpPoint, that.pointAfterResize) < 10) {
					that.pointAfterResize = undefined;
					return;
				} else {
					that.pointAfterResize = undefined;
				}
			}
			if (that.docIsNotReadOnly()) {
				await that.placeNodeOnClick(evt);
			}
		});

		//place node on click

		//eslint-disable-next-line
		that.JC3.mouseup(async (_evt: MouseEvent) => {
			that.panStartAt = undefined;
			that.ignoreClick = false;
		});

		//eslint-disable-next-line
		that.JC1.on('mousemove', function (_evt: MouseEvent) {
			that.onC3 = true;
		});
		that.JC3.on('mousemove', function (evt: MouseEvent) {
			that.onC3 = true;
			that.currentMousePos.x = evt.clientX;
			that.currentMousePos.y = evt.clientY;

			//跟随鼠标的indicator图标的位置, 在鼠标的位置向右右下偏移10个像素点
			const indicatorX = that.scrXToJc1X(that.currentMousePos.x) + 10;
			const indicatorY = that.scrYToJc1Y(that.currentMousePos.y) + 10;

			$('#modeIndicator').css('left', indicatorX);
			$('#modeIndicator').css('top', indicatorY);
			// that.kuangXuanEndPoint = {
			//   x: that.scrXToJc3X(evt.clientX),
			//   y: that.scrYToJc3Y(evt.clientY)
			// };

			//如果文档是只读,返回就可以了
			if (that.docIsReadOnly()) return;

			//把屏幕鼠标位置,翻译为JC3的坐标位置,再翻译成放大缩小后的点坐标
			const tmpPoint = {
				x: that.scalePoint(that.scrXToJc3X(that.currentMousePos.x)),
				y: that.scalePoint(that.scrYToJc3Y(that.currentMousePos.y))
			};

			//检查是否为正在拖动一个形状,还是正在手绘
			if (that.shapeToDrag && that.lineLocked(that.shapeToDrag) === false) {
				if (that.distance(that.mousePosToRemember, that.currentMousePos) > 5) {
					//正在拖动形状
					that.shapeDragging = true;
				}
			} else {
				that.shapeToDrag = null;
			}

			//判断是否为正在框选 .
			//正在编辑时, 这了拖动形状是,正在拖动线条两端时,以及鼠标位于minimap上时,均不处理框选
			if (
				that.isEditting || //正在编辑
				that.shapeDragging || //正在拖动形状
				that.lineTransfomerDragging || //正在拖动线条两端
				that.minimapMouseDown //鼠标位于minimap上
			) {
				that.duringKuangXuan = false; //不再框选过程中
			}

			if (that.tool === 'CONNECT' && that.docIsNotReadOnly()) {
				if (that.linkPosNode.length === 1) {
					//如果当前为连接两个节点,且已经选择了起始点
					that.lineTemping = true;
					let fromPoint = null;
					let toPoint = null;
					let selectedFromIndex = 0;
					let shortestDistance = that.distance(that.tmpPos.points[0], tmpPoint);
					for (let i = 0; i < that.tmpPos.points.length; i++) {
						fromPoint = that.tmpPos.points[i];
						toPoint = tmpPoint;
						const tmp_dis = that.distance(fromPoint, toPoint);
						if (tmp_dis < shortestDistance) {
							shortestDistance = tmp_dis;
							selectedFromIndex = i;
						}
					}
					//画出临时连接线
					that.svgDrawTmpLine(
						that.tmpPos.points[selectedFromIndex].x,
						that.tmpPos.points[selectedFromIndex].y,
						tmpPoint.x,
						tmpPoint.y,
						{
							color: that.YIQColorAux || '#888888',
							stroke: 10
						}
					);
				}
			}
			if (
				that.shapeDragging &&
				that.docIsReadOnly() === false &&
				that.lineLocked(that.shapeToDrag) === false &&
				that.pmsOk('U', that.shapeToDrag) === true
			) {
				const realX = that.scalePoint(that.scrXToJc3X(evt.clientX));
				const realY = that.scalePoint(that.scrYToJc3Y(evt.clientY));
				const deltaX = realX - that.shapeDraggingStartPoint.x;
				const deltaY = realY - that.shapeDraggingStartPoint.y;
				if (that.shapeToDrag.hasClass('kfkpolyline') || that.shapeToDrag.hasClass('kfkpolygon')) {
					const arr = that.shapeToDrag.array();
					that.shapeToDrag.plot(arr);
				}
				that.shapeToDrag.dmove(deltaX, deltaY);
				that.shapeDraggingStartPoint.x += deltaX;
				that.shapeDraggingStartPoint.y += deltaY;
			}
		});

		that.addMinimap();
	}

	isDuringKuangXuan() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (
			that.tool === 'POINTER' &&
			that.kuangXuanMouseIsDown &&
			that.shapeDragging === false &&
			that.lineTransfomerDragging === false &&
			that.minimapMouseDown === false &&
			that.isShowingModal === false &&
			that.isEditting === false &&
			that.isZoomingShape === false
		)
			return true;
		else {
			return false;
		}
	}

	scalePoint(pt: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return pt / that.scaleRatio;
	}

	unscalePoint(pt: any) {
		const that = this;
		return pt * that.scaleRatio;
	}

	addMinimap() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.refreshC3Event = new CustomEvent('refreshC3');
		that.zoomEvent = new CustomEvent('zoomC3');
		that.changedEvent = new CustomEvent('changedC3');
		/*
  import("./minimap/jquery-minimap").then((pack) => {
    that.MiniMap = pack.MiniMap;
    that.MiniMap.minimap($("#minimap"), KFK);
    that.MiniMap.init();
  });
  */
	}

	moveLineMoverTo(point: Point) {
		$('#linetransformer').css('left', point.x - 10);
		$('#linetransformer').css('top', point.y - 10);
	}
	/**
	 * 选定一个元素
	 */
	selectNode(jqDIV: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		jqDIV.addClass('selected');
		that.selectedDIVs.push(jqDIV);
		that.setSelectedNodesBoundingRect();
	}
	deselectNode(jqDIV: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		jqDIV.removeClass('selected');
		const index = that.selectedDIVs.indexOf(jqDIV);
		if (index > -1) {
			that.selectedDIVs.splice(index, 1);
			that.setSelectedNodesBoundingRect();
		}
	}
	selectAllNode() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.selectedDIVs = [];
		that.JC3.find('.kfknode').each(async (_index: any, aNode: any) => {
			$(aNode).addClass('selected');
			that.selectedDIVs.push($(aNode));
		});
		that.setSelectedNodesBoundingRect();
	}
	deselectAllNode() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.selectedDIVs = [];
		that.JC3.find('.kfknode').each(async (_index: any, aNode: any) => {
			$(aNode).removeClass('selected');
		});
		that.setSelectedNodesBoundingRect();
	}
	async selectConnect(svgConnect, evt: MouseEvent) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		svgConnect.addClass('selected');
		that.selectedConnects.push(svgConnect);
		let textClass = '.' + svgConnect.attr('id') + '_text';
		$(textClass).addClass('selected');
		let mpoint = {
			x: that.scrXToJc3X(evt.clientX),
			y: that.scrYToJc3Y(evt.clientY)
		};

		if (that.KEYDOWN.alt && that.docIsReadOnly() === false) {
			let length = svgConnect.length();
			let nearest = 999999999;
			let nearestIndex = -1;
			for (let i = 0; i <= 20; i++) {
				let point = svgConnect.pointAt((i / 20) * length);
				let tmp = that.distance(point, mpoint);
				if (tmp < nearest) {
					nearest = tmp;
					nearestIndex = i;
				}
			}

			let fromId = svgConnect.attr('fid');
			let toId = svgConnect.attr('tid');
			let jqFrom = $('#' + fromId);
			let jqTo = $('#' + toId);
			that.cancelLinkNode();
			that.setTool('CONNECT');
			that.tobeRemovedConnectId = svgConnect.attr('id');
			that.movingConnect = true;
			if (nearestIndex > 10) {
				that.connectEndFirst = false;
				if (that.afterDragging === false) {
					//doing here
					await that.yarkLinkNode(jqFrom);
					//await that.onClickNode(evt, jqFrom);
				} else {
					that.afterDragging = true;
				}
			} else {
				if (that.afterDragging === false) {
					that.connectEndFirst = true;
					await that.yarkLinkNode(jqTo, false);
					//await that.onClickNode(evt, jqTo);
				} else {
					that.afterDragging = true;
				}
			}
		}
	}

	deselectConnect(jqConnect: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		jqConnect.removeClass('selected');
		const index = that.selectedConnects.indexOf(jqConnect);
		if (index > -1) that.selectedConnects.splice(index, 1);
		let textClass = '.' + jqConnect.attr('id') + '_text';
		$(textClass).removeClass('selected');
	}

	/**
	 * 根据选定的多个元素，显示其周围的边框
	 */
	setSelectedNodesBoundingRect() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		let brect = $('.boundingrect');
		if (brect.length <= 0) {
			const rect = document.createElement('div');
			brect = $(rect);
			brect.addClass('boundingrect');
			brect.appendTo(that.JC3);
			brect.css('z-index', -1);
		}
		if (that.selectedDIVs.length > 1) {
			const rect: Rectangle = that.getBoundingRectOfSelectedDIVs();
			brect.css('left', rect.left - cocoConfig.ui.boundingrect_padding);
			brect.css('top', rect.top - cocoConfig.ui.boundingrect_padding);
			brect.css('width', rect.width + cocoConfig.ui.boundingrect_padding * 2);
			brect.css('height', rect.height + cocoConfig.ui.boundingrect_padding * 2);
			brect.show();
		} else {
			brect.hide();
		}
	}
	kuangXuan(pt1: Point, pt2: Point) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const x1 = pt1.x + that.LeftB;
		const y1 = pt1.y + that.TopB;
		const x2 = pt2.x + that.LeftB;
		const y2 = pt2.y + that.TopB;
		if (Math.abs(x1 - x2) < 10 && Math.abs(y1 - y2) < 10) {
			//这里，如果滑动大小横向和纵向都小于10， 则不作为框选
			return;
		}
		const jqRect = $('#selectingrect');
		jqRect.css('left', Math.min(x1, x2));
		jqRect.css('top', Math.min(y1, y2));
		jqRect.css('width', Math.abs(x1 - x2));
		jqRect.css('height', Math.abs(y1 - y2));
		that.duringKuangXuan = true;
		jqRect.show();
	}

	reverseColor(color: string) {
		return color;
	}

	selectShape(theShape: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		let alreadySelected = false;
		for (let i = 0; i < that.selectedShapes.length; i++) {
			if (that.selectedShapes[i].attr('id') === theShape.attr('id')) {
				alreadySelected = true;
				break;
			}
		}
		if (alreadySelected) return;
		that.selectedShapes.push(theShape);
		let prevWidth = theShape.attr('stroke-width');
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		prevWidth = KFKclass.unpx(prevWidth);
		theShape.addClass('selected');
		const color = theShape.attr('origin-color');
		that.shapeOriginColor = color;
		//let color1 = that.reverseColor(color);
		const originWidth = theShape.attr('origin-width');
		const newWidth =
			originWidth * 2 > that.CONST.MAX_SHAPE_WIDTH ? originWidth : that.CONST.MAX_SHAPE_WIDTH;
		theShape.stroke({
			width: newWidth,
			color: '#0000FF'
		});
	}
	isShapeSelected(theShape: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.selectedShapes.length <= 0) {
			return false;
		} else {
			if (that.selectedShapes.indexOf(theShape) >= 0) {
				return true;
			} else {
				return false;
			}
		}
	}

	getShapeConfig(shapeType: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return that.APP.model.svg[shapeType];
	}

	getShapeRect(svgShape: any) {
		const x = svgShape.x();
		const y = svgShape.y();
		const width = svgShape.width();
		const height = svgShape.height();
		return {
			left: x,
			top: y,
			right: x + width,
			bottom: y + height,
			center: x + width * 0.5,
			middle: y + height * 0.5,
			width: width,
			height: height
		};
	}

	selectNodeOnClick(jqDIV: myJQuery, metaKey: boolean) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const exist = that.selectedDIVs.indexOf(jqDIV);
		if (metaKey) {
			if (exist >= 0) {
				that.deselectNode(that.selectedDIVs[exist]);
			} else {
				that.selectNode(jqDIV);
			}
		} else {
			//Loop to deselecte all nodes
			while (that.selectedDIVs.length > 0) {
				that.deselectNode(that.selectedDIVs[0]);
			}
			while (that.selectedConnects.length > 0) {
				that.deselectConnect(that.selectedConnects[0]);
			}
			that.selectNode(jqDIV);
		}
	}

	async selectConnectOnClick(jqConnect: myJQuery, evt: MouseEvent) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const exist = that.selectedConnects.indexOf(jqConnect);
		let shiftKey = evt.shiftKey;
		if (shiftKey) {
			if (exist >= 0) {
				that.deselectConnect(jqConnect);
			} else {
				await that.selectConnect(jqConnect, evt);
			}
		} else {
			while (that.selectedDIVs.length > 0) {
				that.deselectNode(that.selectedDIVs[0]);
			}
			while (that.selectedConnects.length > 0) {
				that.deselectConnect(that.selectedConnects[0]);
			}
			await that.selectConnect(jqConnect, evt);
		}
	}

	getNearGridPoint(x: Point | number, y?: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (typeof x !== 'number') {
			if (y === undefined && x.x) {
				return that._getNearGridPoint(x.x, x.y);
			}
		} else {
			return that._getNearGridPoint(x, y);
		}
	}
	_getNearGridPoint(x: number, y: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		let newX = x;
		let newY = y;
		if (x % that.APP.model.gridWidth < that.APP.model.gridWidth * 0.5) {
			newX = Math.floor(x / that.APP.model.gridWidth) * that.APP.model.gridWidth;
		} else {
			newX = (Math.floor(x / that.APP.model.gridWidth) + 1) * that.APP.model.gridWidth;
		}
		if (y % that.APP.model.gridWidth < that.APP.model.gridWidth * 0.5) {
			newY = Math.floor(y / that.APP.model.gridWidth) * that.APP.model.gridWidth;
		} else {
			newY = (Math.floor(y / that.APP.model.gridWidth) + 1) * that.APP.model.gridWidth;
		}
		return {
			x: newX,
			y: newY
		};
	}

	getKFKNodeNumber() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const nodes = that.JC3.find('.kfknode');
		return nodes.length;
	}

	//eslint-disable-next-line
	async placeNode(
		_shiftKey: boolean,
		id: string,
		nodeType: string,
		_variant: string,
		x: number,
		y: number,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_w: number,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_h: number,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_attach: any,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_attach2: any
	): Promise<myJQuery> {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		//create node, new node, place node
		const nodeDIV = document.createElement('div');
		const jqDIV: myJQuery = $(nodeDIV);
		jqDIV.attr('id', id);
		let label = 'Activity';
		switch (nodeType) {
			case 'ACTION':
				label = 'Activity';
				break;
			case 'INFORM':
				label = 'Email';
				break;
			case 'SCRIPT':
				label = '';
				break;
			case 'TIMER':
				label = '';
				break;
			case 'SUB':
				label = '';
				break;
			case 'AND':
				label = '';
				break;
			case 'OR':
				label = '';
				break;
			case 'GROUND':
				label = '';
				break;
			case 'THROUGH':
				label = '';
				break;
			default:
				label = 'Activity';
		}
		jqDIV.append('<p>' + label + '</p>');
		if (nodeType === 'ACTION') {
			jqDIV.append('<div class="kvars">e30=</div>');
		}
		await that.JC3.append(nodeDIV);
		const nodeCount = that.getKFKNodeNumber();
		jqDIV.css('top', KFKclass.px(y - that.tplNode_height * 0.5));
		jqDIV.css('left', KFKclass.px(x - that.tplNode_width * 0.5));
		jqDIV.css('z-index', `${nodeCount + 1}`);
		//default padding for all

		jqDIV.addClass('node');
		jqDIV.addClass('kfknode');
		jqDIV.addClass(nodeType);

		await that.setNodeEventHandler(jqDIV);

		that.justCreatedJqNode = jqDIV;
		that.lastCreatedJqNode = jqDIV; //如果在脑图模式下，则自动建立脑图链接
		that.C3.dispatchEvent(that.refreshC3Event);
		return jqDIV;
	}

	removeLinkto(jqNodeDIV: myJQuery) {
		jqNodeDIV.attr('linkto', '');
	}

	startTrx() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.state.TRX_FLAG === 0) {
			that.opArray = [];
		}
		that.state.TRX_FLAG += 1;
	}
	/**
	 * Close operation transaction
	 */
	endTrx() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.state.TRX_FLAG -= 1;
	}
	/**
	 * During operation transaction or not
	 */
	inTrx() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.state.TRX_FLAG > 0) return true;
		else return false;
	}

	/**
	 * 在内存中记录操作历史
	 */
	yarkOpHistory(changedPair: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		//如果没有操作被记录,则提示warn,并返回. 这是一个不应该发生的异常情况.
		that.opstack.splice(that.opz + 1, that.opstacklen);
		if (that.opstack.length >= that.opstacklen) {
			that.opstack.shift();
			that.opz = that.opz - 1;
			if (that.opz < -1) that.opz = -1;
		}
		that.opstack.push(changedPair);
		that.opz = that.opz + 1;
	}

	//jqNode can be a node or even a svgline
	anyLocked(jqNode: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (jqNode) return that.docIsReadOnly() || that.nodeLocked(jqNode);
		else return that.docIsReadOnly();
	}

	notAnyLocked(jqNode: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return !that.anyLocked(jqNode);
	}

	/**
	 * 从新画节点所有的连接线
	 * @param jqNode 要重画连接线的节点
	 * @param reason 画线的原因
	 * @param bothside 如果为false， 则只画从jqNode出去的线； 如为true, 则也画连到jqNode的线
	 * @param allowConnectPoints 控制画线的上下左右连接点。缺省为全部可自动根据最短路线来选择。 一共四个数组，缺省为[[0,1,2,3],[0,1,2,3],[0,1,2,3],[0,1,2,3]]
	 * 第一个数组为连接出去的线条的，from的连接点控制
	 * 第二个数组为连接出去的线条的，to的连接点控制
	 * 第三个数组为连接进来的线条的，from的连接点控制
	 * 第四个数组为连接进来的线条的，to的连接点控制
	 * 每个连接点控制数组中，0表示 左中点； 1表示上中点； 2表示右中点； 3表示下中点
	 */

	async redrawLinkLines(
		jqNode: myJQuery,
		reason = 'unknown',
		bothside = 'both',
		allowConnectPoints = [[2], [0], [2], [0]]
	) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (!(jqNode instanceof jQuery)) {
			console.error('redrawLinkLines for a non-jquery object, sometime caused by no await');
			return;
		}
		const myId = jqNode.attr('id');
		const tplLinks = that.tpl.find(`.link[from="${myId}"]`);

		//得到当前节点连接到的节点id列表
		//let toIds = that.getNodeLinkIds(jqNode, "linkto");
		//找出所有svg连接线条
		const connectLines = that.svgDraw.find('.connect');

		connectLines.each(async (connect: any) => {
			//如果这根连接线条的fid属性是当前node的id
			if (connect.attr('fid') === myId) {
				const connect_id = connect.attr('id');
				//移除线条
				await connect.remove();
				//移除三角
				const triangle_id = connect_id + '_triangle';
				await that.svgDraw.find(`.${triangle_id}`).remove();
			}
		});
		//画出从当前node:jqNode到所有"连接到"节点的连接线
		const anchorPositions = [];
		for (let i = 0; i < tplLinks.length; i++) {
			const toId = $(tplLinks[i]).attr('to');
			const jqTo = $(`#${toId}`);
			let caseValue = $(tplLinks[i]).attr('case');
			caseValue = Parser.isEmpty(caseValue) ? '' : caseValue;
			let setValue = $(tplLinks[i]).attr('set');
			setValue = Parser.isEmpty(setValue) ? '' : setValue;
			const anchorPair = await that.drawConnect(
				jqNode,
				jqTo,
				caseValue,
				setValue,
				allowConnectPoints[0],
				allowConnectPoints[1],
				true
			);
			//anchorPair返回一个包含两个数字的数组,第一个数字标识父节点的锚点位置,第二个数字标识子节点的锚点位置
			anchorPositions.push(anchorPair[0]);
		}

		//如果是双边画线,则需要找出那些父节点
		if (bothside === 'both' || bothside === 'right') {
			const guiLinks_toMe = that.tpl.find(`.link[to="${myId}"]`);

			const anchorPositions = [];
			for (let i = 0; i < guiLinks_toMe.length; i++) {
				const fromId = $(guiLinks_toMe[i]).attr('from');
				const jqFrom = $(`#${fromId}`);
				let caseValue = $(guiLinks_toMe[i]).attr('case');
				caseValue = Parser.isEmpty(caseValue) ? '' : caseValue;
				let setValue = $(guiLinks_toMe[i]).attr('set');
				setValue = Parser.isEmpty(setValue) ? '' : setValue;
				const anchorPair = await that.drawConnect(
					jqFrom,
					jqNode,
					caseValue,
					setValue,
					allowConnectPoints[2],
					allowConnectPoints[3],
					true
				);
				anchorPositions.push(anchorPair[0]);
			}
		}
	}

	/**
	 * Process keypool
	 *
	 */
	async procKeypool(evt) {
		let that = this;
		if (that.keypoolCleanTimeout) {
			clearTimeout(that.keypoolCleanTimeout);
		}
		that.keypoolCleanTimeout = setTimeout(() => {
			that.keypool = '';
			that.keypoolCleanTimeout = null;
		}, 2000);
		if (that.docIsReadOnly()) return;
		//Delete node or connect
		if (that.hoveredConnect) {
			if (that.keypool === 'd') {
				that.deleteObjects(evt, false);
				that.keypool = '';
			} else if (that.keypool === 'f' || that.keypool === 't') {
				that.cancelLinkNode();
				that.setTool('CONNECT');
				that.tobeRemovedConnectId = that.hoveredConnect.attr('id');
				that.movingConnect = true;
				let jqFrom = $('#' + that.hoveredConnect.attr('fid'));
				let jqTo = $('#' + that.hoveredConnect.attr('tid'));
				that.clipboardConnectText = that.hoveredConnect.attr('case');
				if (Parser.isEmpty(that.clipboardConnectText)) {
					that.clipboardConnectText = null;
				}
				//CE: Connect  END node
				if (that.keypool === 't') {
					that.connectEndFirst = false;
					that.movingEnd = true;
					await that.yarkLinkNode(jqFrom);
				} else {
					//CB: Connect Begin node
					that.connectEndFirst = true;
					that.movingEnd = true;
					await that.yarkLinkNode(jqTo, false);
				}
				that.keypool = '';
			}
		}
		if (that.keypool === 'd') {
			if (that.hoverJqDiv() || that.hoveredConnect) {
				that.deleteObjects(evt, false);
				that.keypool = '';
			}
		} else if (
			//GT: Connect to
			('t' === that.keypool || 'gt' === that.keypool) &&
			that.hoverJqDiv() &&
			that.hoverJqDiv().hasClass('END') === false
		) {
			that.cancelLinkNode();
			that.setTool('CONNECT');
			await that.yarkLinkNode(that.hoverJqDiv());
			that.keypool = '';
		} else if (['cb', 'ce'].includes(that.keypool) && that.hoveredConnect) {
			//Connect Begin/End node
			that.cancelLinkNode();
			that.setTool('CONNECT');
			that.tobeRemovedConnectId = that.hoveredConnect.attr('id');
			that.movingConnect = true;
			let jqFrom = $('#' + that.hoveredConnect.attr('fid'));
			let jqTo = $('#' + that.hoveredConnect.attr('tid'));
			that.clipboardConnectText = that.hoveredConnect.attr('case');
			if (Parser.isEmpty(that.clipboardConnectText)) {
				that.clipboardConnectText = null;
			}
			//CE: Connect  END node
			if (that.keypool === 'ce') {
				that.connectEndFirst = false;
				that.movingEnd = true;
				await that.yarkLinkNode(jqFrom);
			} else {
				//CB: Connect Begin node
				that.connectEndFirst = true;
				that.movingEnd = true;
				await that.yarkLinkNode(jqTo, false);
			}
			that.keypool = '';
		} else if (['ct'].includes(that.keypool) && that.hoveredConnect) {
			that.setConnectText(that.hoveredConnect, '', '');
			that.keypool = '';
		}
	}

	async setConnectionStatusColor(routeStatus) {
		const that = this;

		let connectNumber = 0;
		for (let i = 0; i < routeStatus.length; i++) {
			let aRoute = routeStatus[i];
			let connectId = 'connect_' + aRoute.from_nodeid + '_' + aRoute.to_nodeid;
			try {
				KFK.replaceSTClassTo(
					$(`#${connectId}`),
					aRoute.status === 'ST_IGNORE' ? 'ST_IGNORE' : KFK.getSTClass($(`#${aRoute.to_nodeid}`))
				);
				connectNumber += 1;
			} catch (e) {}
		}
		return connectNumber;
	}

	getNodeDefaultSize(nodeType: string, variant: string) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		let ret = { w: 100, h: 40 };
		if (
			that.config.defaultSize[nodeType] &&
			that.config.defaultSize[nodeType][variant] &&
			that.config.defaultSize[nodeType][variant].width &&
			that.config.defaultSize[nodeType][variant].height
		) {
			ret = {
				w: that.config.defaultSize[nodeType][variant].width,
				h: that.config.defaultSize[nodeType][variant].height
			};
		} else if (
			that.config.node[nodeType] &&
			that.config.node[nodeType].style &&
			that.config.node[nodeType].style.width &&
			that.config.node[nodeType].style.height
		) {
			ret = {
				w: that.config.node[nodeType].style.width,
				h: that.config.node[nodeType].style.height
			};
		} else {
			ret = {
				w: 100,
				h: 40
			};
		}
		return ret;
	}

	//用于对已有的nodeEvent进行修改控制，如enable, disable, destroy
	//action: one of resizable/droppable/draggable
	//cmd: one of enable, disable destroy
	updateNodeEvent(jqNode: myJQuery, action: string, cmd: string) {
		if (action === 'resizable') {
			if (cocoConfig.node[jqNode.attr('nodetype')].resizable) {
				jqNode.resizable(cmd);
			}
		} else if (action === 'droppable') {
			if (cocoConfig.node[jqNode.attr('nodetype')].droppable) {
				jqNode.droppable(cmd);
			}
		} else if (action === 'draggable') {
			jqNode.draggable(cmd);
		}
	}
	getNodeById(nodeId: string) {
		return $('#' + nodeId);
	}

	//用在index.js中的boostrapevue
	isActive(tool: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return that.tool === tool;
	}

	width(w?: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (w) {
			that._width = w;
			//that.stage.width(w);
		}
		return that._width;
	}
	height(h?: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (h) {
			that._height = h;
			//that.stage.height(h);
		}
		return that._height;
	}

	size(w: number, h: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.width(w);
		that.height(h);
	}
	/**
	 * 是否是一个kfknode
	 * @param a node div
	 */
	isKfkNode(jqdiv: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return that.isA(jqdiv, 'kfknode');
	}
	/**
	 * 是否是一个有某个className的对象
	 * @param jqdiv  要检查的对象
	 * @param className 要检查的className
	 * @return true，如果有这个className， false如果没有这个className
	 */
	isA(jqdiv: myJQuery, className: string) {
		return jqdiv && jqdiv.hasClass(className);
	}
	/**
	 * 是否不是一个有某个className的对象
	 * 跟 isA(jqdiv, className)相反
	 *
	 * @param jqdiv  要检查的对象
	 * @param className 要检查的className
	 * @return true，如果没有这个className， false如果有这个className
	 */
	isNotA(jqdiv: myJQuery, className: string) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return !that.isA(jqdiv, className);
	}

	holdEvent(evt: Event) {
		evt.stopImmediatePropagation();
		evt.stopPropagation();
		evt.preventDefault();
	}

	/**
	 * 只是检查是否不包含“noedit" class, 以及是否有innerlink属性
	 */
	updateable(jqNode: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.isNotA(jqNode, 'noedit') || jqNode.attr('innerlink')) {
			return true;
		} else {
			return false;
		}
	}

	async driveNodeBalls(jqNodeDIV: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		//The link lines start from jqNodeDIV;
		const tplLinks = that.tpl.find(`.link[from="${jqNodeDIV.attr('id')}"]`);
		const needToAdd = tplLinks.length - that.tmpBalls.length;
		//How many extra balls we need to create
		for (let i = 0; i < needToAdd; i++) {
			const tmpBall = that.ball.clone();
			const ballId = 'ball_' + that.myuid();
			tmpBall.attr('id', ballId);
			tmpBall.addClass(ballId);
			tmpBall.addTo(that.ball.parent());
			that.tmpBalls.push(tmpBall);
		}
		/*
		for (let i = 0; i < tplLinks.length; i++) {
			that.tmpBalls[i].removeClass('noshow');
			that.tmpBalls[i].fill(that.config.connect.styles.style1.normal.color);
		}
		*/
		tplLinks.each(async (index: number, link: any) => {
			that.tmpBalls[index].removeClass('noshow');
			that.tmpBalls[index].fill(that.config.connect.styles.style1.normal.color);
			const jLink = $(link);
			that.tmpBalls[index].attr('connect', `${jLink.attr('from')}_${jLink.attr('to')}`);
			const connectSelector = `.connect_${jLink.attr('from')}_${jLink.attr('to')}`;
			const svgConnect = that.svgDraw.findOne(connectSelector);
			const lengthOfConnectorLine = svgConnect.length();
			const runner_duration = 1500;
			const runner = await that.tmpBalls[index].animate({ duration: runner_duration, when: 'now' });
			runner.ease('>');
			runner
				.during(function (pos: number) {
					const p = svgConnect.pointAt(pos * lengthOfConnectorLine);
					that.tmpBalls[index] && that.tmpBalls[index].center(p.x, p.y);
				})
				.loop(9999);
		});
	}

	async stopNodeBalls() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		for (let i = 0; i < that.tmpBalls.length; i++) {
			await that.tmpBalls[i].timeline().stop();
			await that.tmpBalls[i].addClass('noshow');
		}
	}

	/**
	 * 开始节点编辑，根据节点类型，相应使用不同的编辑器
	 * 单行文字用inline editing，  textblock和yellowtip用textarea
	 */
	getNull(value: any) {
		switch (value) {
			case undefined:
			case null:
			case 'undefined':
			case 'null':
				return true;
			default:
				return false;
		}
	}

	getBoolean(value: string | number | boolean) {
		return [true, 'true', 1, '1', 'on', 'yes'].indexOf(value) >= 0;
	}

	divLeft(jqDiv: myJQuery) {
		return KFKclass.unpx(jqDiv.css('left'));
	}
	divCenter(jqDiv: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return that.divLeft(jqDiv) + that.divWidth(jqDiv) * 0.5;
	}
	divRight(jqDiv: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return that.divLeft(jqDiv) + that.divWidth(jqDiv);
	}
	divTop(jqDiv: myJQuery) {
		return KFKclass.unpx(jqDiv.css('top'));
	}
	divMiddle(jqDiv: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return that.divTop(jqDiv) + that.divHeight(jqDiv) * 0.5;
	}
	divBottom(jqDiv: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return that.divTop(jqDiv) + that.divHeight(jqDiv);
	}
	divWidth(jqDiv: myJQuery) {
		return KFKclass.unpx(jqDiv.css('width'));
	}
	divHeight(jqDiv: myJQuery) {
		return KFKclass.unpx(jqDiv.css('height'));
	}
	divRect(jqDiv: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return {
			left: that.divLeft(jqDiv),
			top: that.divTop(jqDiv),
			right: that.divRight(jqDiv),
			bottom: that.divBottom(jqDiv),
			center: that.divCenter(jqDiv),
			middle: that.divMiddle(jqDiv),
			width: that.divWidth(jqDiv),
			height: that.divHeight(jqDiv)
		};
	}
	divMove(jqDiv: myJQuery, left: number, top: number) {
		jqDiv.css({
			left: left,
			top: top
		});
	}
	divDMove(jqDiv: myJQuery, deltaX: number, deltaY: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const left = that.divLeft(jqDiv);
		const top = that.divTop(jqDiv);
		jqDiv.css({
			left: left + deltaX,
			top: top + deltaY
		});
	}

	scroll_posX(x: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return x + that.scrollContainer.scrollLeft();
	}
	scroll_posY(y: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return y + that.scrollContainer.scrollTop();
	}

	async deleteLinks(_jqDIV: myJQuery, links: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		links.each(async (_index: any, link: any) => {
			const jLink = $(link);
			const connect_id = `connect_${jLink.attr('from')}_${jLink.attr('to')}`;
			await that.removeConnectById(connect_id);
		});
	}

	/**
	 * 去掉一个div的所有链接
	 * @param jqDIV 元素
	 * @param forDelete 这个节点是要被删除吗？
	 */
	async cleanUpConnection(jqDIV: myJQuery, forDelete = false) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		//删除linkto线条
		const myId = jqDIV.attr('id');
		const toIds = KFKclass.stringToArray(jqDIV.attr('linkto'));
		toIds.forEach((toId) => {
			const lineClassSelector = `.connect_${myId}_${toId}`;
			const triClassSelector = `.connect_${myId}_${toId}_triangle`;
			try {
				that.svgDraw.findOne(lineClassSelector).remove();
				// eslint-disable-next-line no-empty
			} catch (err) {
				// eslint-disable-next-line no-empty
			} finally {
			}
			try {
				that.svgDraw.findOne(triClassSelector).remove();
				// eslint-disable-next-line no-empty
			} catch (err) {
				// eslint-disable-next-line no-empty
			} finally {
			}
		});
		//如果这个节点不是要删除，那么它的变化要被记录
		if (forDelete === false) {
			if (toIds.length > 0) {
				jqDIV.attr('linkto', '');
			}
		}

		//重置全局ZIndex 同时，删除那些链接到当前节点的连接线
		const myZI = that.getZIndex(jqDIV);
		const allnodes = that.JC3.find('.kfknode');
		let tmp1 = '';
		allnodes.each(async (_index: any, aDIV: any) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const jqDIV = $(aDIV);
			const fromId = jqDIV.attr('id');
			const tmpzi = that.getZIndex(jqDIV);
			if (tmpzi > myZI) {
				that.setZIndex(jqDIV, tmpzi - 1);
			}
			tmp1 = jqDIV.attr('linkto');
			const arr = KFKclass.stringToArray(tmp1);
			if (arr.indexOf(myId) >= 0) {
				arr.splice(arr.indexOf(myId), 1);
				jqDIV.attr('linkto', arr.join(','));

				const lineClassSelector = `.connect_${fromId}_${myId}`;
				const triClassSelector = `.connect_${fromId}_${myId}_triangle`;
				try {
					that.svgDraw.findOne(lineClassSelector).remove();
					// eslint-disable-next-line no-empty
				} catch (err) {
					// eslint-disable-next-line no-empty
				} finally {
				}
				try {
					that.svgDraw.findOne(triClassSelector).remove();
					// eslint-disable-next-line no-empty
				} catch (err) {
					// eslint-disable-next-line no-empty
				} finally {
				}
			}
		});
		const nodeIndex = that.selectedDIVs.indexOf(jqDIV);
		if (nodeIndex >= 0) {
			that.selectedDIVs.splice(nodeIndex, 1);
			that.setSelectedNodesBoundingRect();
		}
	}

	async _deleteShape(svgLine: any) {
		svgLine.attr({
			'stroke-width': svgLine.attr('origin-width')
		});
	}

	hoverSvgLine(svgline?: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (svgline !== undefined) {
			that._svghoverline = svgline;
			if (svgline !== null) that.hoverJqDiv(null);
		} else {
			return that._svghoverline;
		}
	}

	hoverJqDiv(jqdiv?: myJQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (jqdiv !== undefined) {
			that._jqhoverdiv = jqdiv;
			if (jqdiv !== null) that.hoverSvgLine(null);
		} else {
			return that._jqhoverdiv;
		}
	}

	deleteSingleNode(jqDIV: any, cutMode: boolean, immediateOnChange: boolean = true) {
		let that = this;
		if (that.anyLocked(jqDIV)) return;
		if (jqDIV.hasClass('START') || jqDIV.hasClass('END')) {
			return;
		}
		if (cutMode === true) {
			//copy时不过滤nocopy
			const jTemp = jqDIV.clone();
			const jTitle = jTemp.find('.coco_title');
			if (jTitle.length > 0) {
				jTitle.text(jTitle.text() + '的复制');
			}
			that.copyCandidateDIVs.push(jTemp);
		}
		jqDIV.shouldBeDeleted = true;
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		that.stopNodeBalls();
		const myId = jqDIV.attr('id');
		const links = that.tpl.find(`.link[from="${myId}"], .link[to="${myId}"]`);
		that.yarkOpHistory({
			obj: 'node',
			from: jqDIV,
			to: null,
			links: links
		});
		that.deleteLinks(jqDIV, links).then((ret) => {});
		jqDIV.remove();
		if (immediateOnChange) that.onChange('Delete');
	}

	async deleteSingleConnect(connectId) {
		let that = this;
		//delete connect
		//最后看鼠标滑过的connect（节点间连接线）
		//Find ids of the two nodes connected by this connect.
		const tmpNodeIdPair = that.getNodeIdsFromConnectId(that.hoveredConnectId);
		const nid = tmpNodeIdPair[0];
		const tid = tmpNodeIdPair[1];
		//let jqFrom = $(`#${nid}`);
		//let jqTo = $(`#${tid}`);
		//if (that.anyLocked(jqFrom)) return;
		//if (that.anyLocked(jqTo)) return;
		//let oldJq = jqFrom.clone();
		//Remove this connect from the FROM node
		//that.removeLinkTo(jqFrom, tid);
		//let connect_id = `connect_${nid}_${tid}`;
		//Remove ths connect drawing
		const tmp = that.tpl.find(`.link[from="${nid}"][to="${tid}"]`);
		await that.removeConnectById(that.hoveredConnectId);
		//await that.redrawLinkLines(jqFrom);
		//删除一个connect, 则jqFrom被修改
	}

	/**
	 * 删除hover或者selected 节点
	 * @param evt oncut事件
	 * @param cutMode， 是否是cut方式，cut方式下，删除前先复制
	 */
	async deleteObjects(
		evt: Event | JQuery.KeyDownEvent<Document, null, Document, Document>,
		cutMode = false
	) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		//如果有多个节点被选择，则优先进行多项删除
		if (that.docIsReadOnly()) return;
		let affectedParentsArray = [];
		that.startTrx();
		try {
			that.copyCandidateDIVs = [];
			that.copyCandidateLines = [];
			let objectDeleted = 0;
			if (that.hoverJqDiv() || that.hoveredConnectId) {
				//没有多项选择时，则进行单项删除
				//首先，先处理鼠标滑过的NODE
				if (that.hoverJqDiv()) {
					const theDIV = that.hoverJqDiv();
					that.deleteSingleNode(theDIV, cutMode);
					that.hoverJqDiv(null);
					that.onChange('Delete hovered Node');
				} else if (that.hoveredConnectId) {
					that.deleteSingleConnect(that.hoveredConnectId);
					that.onChange('Delete hovered Connect');
				}
			} else if (
				that.selectedDIVs.length > 0 ||
				that.selectedShapes.length > 0 ||
				that.selectedConnects.length > 0
			) {
				if (that.selectedDIVs.length > 0) {
					let notLockedCount = 0;
					for (let i = 0; i < that.selectedDIVs.length; i++) {
						if (that.anyLocked(that.selectedDIVs[i]) === false) {
							notLockedCount += 1;
						}
					}
					if (notLockedCount > 0) {
						for (let i = 0; i < that.selectedDIVs.length; i++) {
							if (that.anyLocked(that.selectedDIVs[i])) continue;
							that.deleteSingleNode(that.selectedDIVs[i], cutMode, false);
							objectDeleted++;
							affectedParentsArray.push([...that.getParent(that.selectedDIVs[i])]);
						}

						affectedParentsArray = that.AdvOps.uniquefyKfkObjectArray(affectedParentsArray);
					}
					$('.boundingrect').hide();
				}
				for (let i = 0; i < that.selectedConnects.length; i++) {
					await that.deleteSingleConnect(that.selectedConnects[i]);
					objectDeleted++;
				}
				if (that.selectedShapes.length > 0) {
					let notLockedCount = 0;
					for (let i = 0; i < that.selectedShapes.length; i++) {
						if (that.lineLocked(that.selectedShapes[i]) === false) {
							notLockedCount += 1;
						}
					}
					if (notLockedCount > 0) {
						for (let i = 0; i < that.selectedShapes.length; i++) {
							if (that.lineLocked(that.selectedShapes[i]) === false) {
								that._deleteShape(that.selectedShapes[i]);
							}
						}
					}
				}
				that.onChange('Delete nodes');
			}
			if (that.copyCandidateDIVs.length > 0 || that.copyCandidateLines.length > 0) {
				//判断是否是cut， 而不是delete， cut有clipbaordData, delete没有
				if (evt instanceof ClipboardEvent && evt.clipboardData) {
					evt.clipboardData.setData('text/plain', 'usediv');
					evt.clipboardData.setData('text/html', 'usediv');
				}
			}
			evt.preventDefault();
			that.holdEvent(evt as Event);
		} catch (error) {
			console.error(error);
		} finally {
			that.endTrx();
		}
	}

	getHoverFocusLastCreate() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		let ret = that.hoverJqDiv();
		if (KFKclass.NotSet(ret)) {
			ret = that.lastFocusOnJqNode;
			if (KFKclass.NotSet(ret)) {
				ret = that.lastCreatedJqNode;
				if (KFKclass.NotSet(ret)) {
					ret = undefined;
				}
			}
		}
		return ret;
	}

	getFocusHoverLastCreate() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		let ret = that.lastFocusOnJqNode;
		if (KFKclass.NotSet(ret)) {
			ret = that.hoverJqDiv();
			if (KFKclass.NotSet(ret)) {
				ret = that.lastCreatedJqNode;
				if (KFKclass.NotSet(ret)) {
					ret = undefined;
				}
			}
		}
		return ret;
	}

	getPropertyApplyToJqNode() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		let ret = null;
		if (that.hoverJqDiv() !== null) {
			ret = that.hoverJqDiv();
		} else if (that.lastFocusOnJqNode != null) {
			ret = that.lastFocusOnJqNode;
		} else if (that.justCreatedJqNode != null) {
			ret = that.justCreatedJqNode;
		} else {
			ret = null;
		}
		return ret;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async makeCopyOfJQs(jqstocopy: string | any[], _shiftKey: boolean) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		//现在是移动指定位置再次META-D才放置对象,因此offset没用.事实上,offset在复制node时就一直没有用到

		const startPoint = {
			x: that.divLeft(jqstocopy[0]),
			y: that.divTop(jqstocopy[0])
		};
		that.startTrx();
		try {
			for (let i = 0; i < jqstocopy.length; i++) {
				const oldJqPos = {
					x: that.divLeft(jqstocopy[i]),
					y: that.divTop(jqstocopy[i])
				};
				const deltaX = oldJqPos.x - startPoint.x;
				const deltaY = oldJqPos.y - startPoint.y;
				const jqNewNode = that.makeCloneDIV(jqstocopy[i], that.myuid(), {
					left:
						that.scalePoint(that.scrXToJc3X(that.currentMousePos.x)) -
						that.tplNode_width * 0.5 +
						deltaX,

					top:
						that.scalePoint(that.scrYToJc3Y(that.currentMousePos.y)) -
						that.tplNode_height * 0.5 +
						deltaY
				});
				that.justCreatedJqNode = jqNewNode;
				that.lastCreatedJqNode = jqNewNode;

				jqNewNode.appendTo(that.C3);
				await that.setNodeEventHandler(jqNewNode, async function () {
					if (i === 0) that.focusOnNode(jqNewNode);
				});
			}
		} finally {
			that.endTrx();
			that.onChange('Copy');
		}
		return;
	}

	makeCloneDIV(orig: myJQuery, newid: string, newcss: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const ret = orig.clone(false);
		ret.attr('id', newid);
		if (newcss) ret.css(newcss);
		that.removeNodeEventFootprint(ret);

		return ret;
	}
	async makeCopyOfLines(linestocopy: string | any[]) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const startPoint = {
			x: linestocopy[0].cx(),
			y: linestocopy[0].cy()
		};
		for (let i = 0; i < linestocopy.length; i++) {
			const newLine = linestocopy[i].clone();
			const deltaX = linestocopy[i].cx() - startPoint.x;
			const deltaY = linestocopy[i].cy() - startPoint.y;

			const newline_id = 'shape_' + that.myuid();
			const classes = newLine.classes();
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			classes.forEach((className: string, _index: number) => {
				if (className !== 'kfkshape') {
					newLine.removeClass(className);
				}
			});
			newLine.attr('id', newline_id);
			newLine.addClass(newline_id);
			//现在是移动指定位置再次META-D才放置对象,因此offset没用.
			//之前的代码在x,y后面分别加了个20, 以便不覆盖到节点
			//现在第一次点取不马上复制了,+offset已经没有了必要
			newLine.center(
				that.scalePoint(that.scrXToJc3X(that.currentMousePos.x)) + deltaX,
				that.scalePoint(that.scrYToJc3Y(that.currentMousePos.y)) + deltaY
			);
			// newLine.addTo(linestocopy[i].parent());
			newLine.addTo(that.svgDraw);
			that.addShapeEventListner(newLine);
		}
	}

	getBoundingRectOfSelectedDIVs(): Rectangle {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.selectedDIVs.length == 0) return;
		const ret: Rectangle = {
			left: that.divLeft(that.selectedDIVs[0]),
			top: that.divTop(that.selectedDIVs[0]),
			right: that.divRight(that.selectedDIVs[0]),
			bottom: that.divBottom(that.selectedDIVs[0]),
			width: 0,
			height: 0
		};
		for (let i = 0; i < that.selectedDIVs.length; i++) {
			const tmpRect = {
				left: that.divLeft(that.selectedDIVs[i]),
				top: that.divTop(that.selectedDIVs[i]),
				right: that.divRight(that.selectedDIVs[i]),
				bottom: that.divBottom(that.selectedDIVs[i])
			};
			if (tmpRect.left < ret.left) {
				ret.left = tmpRect.left;
			}
			if (tmpRect.top < ret.top) {
				ret.top = tmpRect.top;
			}
			if (tmpRect.right > ret.right) {
				ret.right = tmpRect.right;
			}
			if (tmpRect.bottom > ret.bottom) {
				ret.bottom = tmpRect.bottom;
			}
		}
		ret.width = ret.right - ret.left;
		ret.height = ret.bottom - ret.top;

		return ret;
	}

	getText(jqdiv: myJQuery) {
		const text_filter = '.innerobj';
		return jqdiv.find(text_filter).text();
	}

	setText(jqdiv: myJQuery, text: string) {
		const text_filter = '.innerobj';
		return jqdiv.find(text_filter).text(text);
	}

	jc3PosToJc1Pos(pos: Point) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return {
			x: pos.x * that.scaleRatio + that.LeftB,
			y: pos.y * that.scaleRatio + that.TopB
		};
	}

	jc3XToJc1X(x: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return x + that.LeftB;
	}
	jc3YToJc1Y(y: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return y + that.TopB;
	}
	jc1XToJc3X(x: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return x - that.LeftB;
	}
	jc1YToJc3Y(y: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return y - that.TopB;
	}

	//Screen pos x to JC3 pos x
	scrXToJc3X(x: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return that.scrXToJc1X(x) - that.LeftB;
	}
	scrYToJc3Y(y: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return that.scrYToJc1Y(y) - that.TopB;
	}

	//Screen pos x to JC1 pos x
	scrXToJc1X(x: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return x + that.JS1.scrollLeft();
	}
	scrYToJc1Y(y: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return y + that.JS1.scrollTop();
	}
	jc1XToScrX(x: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return x - that.JS1.scrollLeft();
	}
	jc1YToScrY(y: number) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return y - that.JS1.scrollTop();
	}

	saveLocalViewConfig() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		localStorage.setItem('viewConfig', JSON.stringify(that.APP.model.viewConfig));
	}
	rgba2hex(orig: string) {
		let a: number;
		const rgb: any = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i);
		const alpha: string = ((rgb && rgb[4]) || '').trim();
		let hex = rgb
			? (rgb[1] | (1 << 8)).toString(16).slice(1) +
			  (rgb[2] | (1 << 8)).toString(16).slice(1) +
			  (rgb[3] | (1 << 8)).toString(16).slice(1)
			: orig;
		if (alpha !== '') {
			a = parseInt(alpha);
		} else {
			a = 0o1;
		}

		a = Math.round(a * 100) / 100;
		const alpha1 = Math.round(a * 255);
		const hexAlpha = (alpha1 + 0x10000).toString(16).substr(-2).toUpperCase();
		hex = `${hex}${hexAlpha}`;

		return '#' + hex;
	}

	secureHexColor(color: string) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (color.startsWith('rgb')) {
			return that.rgba2hex(color);
		} else {
			return color;
		}
	}
	setGridColor(bgcolor: string) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (!bgcolor) {
			bgcolor = $('#overallbackground').css('background-color');
		}
		if (that.YIQColor === 'black') {
			$('#containerbkg').removeClass('grid1');
			$('#containerbkg').addClass('grid2');
		} else {
			$('#containerbkg').removeClass('grid2');
			$('#containerbkg').addClass('grid1');
		}
	}

	toggleShowGrid(checked: boolean) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (checked) {
			let bgcolor = $('#containerbkg').css('background-color');
			bgcolor = that.secureHexColor(bgcolor);
			that.setGridColor(bgcolor);
		} else {
			$('#containerbkg').removeClass('grid1');
			$('#containerbkg').removeClass('grid2');
		}
		that.saveLocalViewConfig();
	}

	initLineTransformer() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		$('#linetransformer').draggable({
			// move line resize line transform line
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			start: (evt, _ui) => {
				//that.closeActionLog();
				that.lineTransfomerDragging = true;
				// that.fromJQ = that.tobeTransformJqLine.clone();
				// that.setTool('line');
				evt.stopImmediatePropagation();
				evt.stopPropagation();
			},

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			drag: (evt, _ui) => {
				if (that.tempSvgLine) that.tempSvgLine.hide();
				if (that.lineToResize === null) return;
				const parr = that.lineToResize.array();
				const stopAtPos = that.C3MousePos(evt);
				if (that.moveLinePoint === 'from') {
					that.lineToResize.plot([[stopAtPos.x, stopAtPos.y], parr[1]]);
				} else {
					that.lineToResize.plot([parr[0], [stopAtPos.x, stopAtPos.y]]);
				}
			},
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			stop: async (evt, _ui) => {
				//transform line  change line
				that.lineTransfomerDragging = false;
				if (that.lineToResize === null) return;
				that.setShapeToRemember(that.lineToResize);
				const parr = that.lineToResize.array();
				let stopAtPos = that.C3MousePos(evt);
				if (that.APP.model.viewConfig.snap) {
					stopAtPos = that.getNearGridPoint(stopAtPos);
					const smp = that.ScreenMousePos(stopAtPos);
					KFKclass.moveDIVCenterToPos($('#linetransformer'), smp);
				}
				if (that.moveLinePoint === 'from') {
					that.lineToResize.plot([[stopAtPos.x, stopAtPos.y], parr[1]]);
				} else {
					that.lineToResize.plot([parr[0], [stopAtPos.x, stopAtPos.y]]);
				}
				KFKclass.hide('#linetransformer');
			}
		}); //line transformer. draggable()
	}

	loadModule(moduleName: string) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		switch (moduleName) {
			case 'AdvOps':
				that.AdvOps
					? that.debug('AdvOps already loaded')
					: import('./advOps').then((pack) => {
							that.AdvOps = pack.AdvOps;
					  });
				break;
			case 'DivStyler':
				that.DivStyler
					? that.debug('DivStyler already exists')
					: import('./divStyler').then((pack) => {
							that.DivStyler = pack.DivStyler;
					  });
				break;
		}
	}

	addSvgLayer() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.svgDraw && delete that.svgDraw;
		that.svgDraw = SVG().addTo('#C3').size(that._width, that._height);
		that.svgDraw.attr('id', 'D3');
		that.svgDraw.addClass('svgcanvas');

		that.pageBounding = {
			Pages: []
		};
		const boundingLineOption = {
			color: '#FFFFFFCC',
			width: 4,
			linecap: 'square'
		};
		for (let i = 0; i < that.PageNumberVert; i++) {
			for (let j = 0; j < that.PageNumberHori; j++) {
				that.pageBounding.Pages.push({
					left: j * that.PageWidth,
					top: i * that.PageHeight
				});
			}
		}
		for (let i = 0; i <= that.PageNumberHori; i++) {
			const tmpLine = that.svgDraw.line(i * that.PageWidth, 0, i * that.PageWidth, that._height);
			tmpLine.addClass('pageBoundingLine').stroke(boundingLineOption);
			if (cocoConfig.viewConfig.showbounding === false) {
				tmpLine.addClass('noshow');
			}
		}
		for (let j = 0; j <= that.PageNumberVert; j++) {
			const tmpLine = that.svgDraw.line(0, j * that.PageHeight, that._width, j * that.PageHeight);
			tmpLine.addClass('pageBoundingLine').stroke(boundingLineOption);
			if (cocoConfig.viewConfig.showbounding === false) {
				tmpLine.addClass('noshow');
			}
		}

		//在连接线上跑动，用于显示连接线的标识球
		//以后多条线上的标识球都是从that.ball clone而来
		that.ball = that.svgDraw.circle(12);
		that.ball.addClass('noshow');
	}

	async init(user: User, bwid, isMobile: boolean = false) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.user = user;
		that.bwid = bwid;
		that.isMobile = isMobile;
		if (that.inited === true) {
			console.error('that.init was called more than once');
		}
		//that.checkBrowser();
		$('body').css('overflow', 'scroll');
		$('.showAfterInit').removeClass('showAfterInit');
		try {
			that.initLayout();
			that.initC3();
			that.initLineTransformer();
			that.initLeftRightPanelEventHandler();
		} catch (error) {
			console.error('Designer initialization error');
			console.error(error);
		}
		that.loadModule('AdvOps');
		that.loadModule('DivStyler');
		//$("body").css("overflow", "hidden");
		if ($('#S1').length < 1) {
			console.warn('S1 not found, designer is missing, should not happen');
			return;
		}
		KFKclass.hide(that.JC3);

		that.addSvgLayer();

		that.opstack.splice(0, that.opstacklen);
		that.opz = -1;
		that.APP.setData('model', 'actionlog', []);

		// that.APP.setData("model", "cocodoc", that.DocController.getDummyDoc());
		// localStorage.removeItem("cocodoc");

		that.focusOnC3();
		that.cancelAlreadySelected();

		//需要在explorer状态下隐藏的，都可以加上noshow, 在进入Designer时，noshow会被去掉
		//并以动画形式显示出来
		$('.padlayout').removeClass('noshow');
		$('.padlayout').fadeIn(1000, function () {
			// Animation complete
		});
		that.helpArea = $('#templatehelp');
	}

	async loadTemplateDoc(template: any, tplmode: string = 'edit') {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		await that.cleanupJC3();
		that.tmpBalls.clear();
		that.template = template;
		that.tplid = that.template.tplid;
		that.workflow = null;
		that.tpl_mode = tplmode;
		if (that.tpl_mode === 'read') {
			that.setTool('POINTER');
		}
		try {
			history.splice(0);
			history.push(that.template.doc);
			history_pointer = 1;
			that.tpl = $(that.template.doc);
			const nodes = that.tpl.find('.node');
			nodes.addClass('kfknode');
			await that.JC3.append(nodes);
			const guiNodes = that.JC3.find('.node');
			await that.addMobileHandler(guiNodes);
			await that.addNodeIdDIV(guiNodes);
			for (let i = 0; i < guiNodes.length; i++) {
				const jqNode = $(guiNodes[i]);
				await that.setNodeEventHandler(jqNode);
				if (that.docIsReadOnly()) {
					jqNode.draggable('disable');
				} else {
					jqNode.draggable('enable');
				}
				await that.redrawLinkLines(jqNode, 'loadTemplateDoc');
			}

			if (that.docIsNotReadOnly()) {
				$('#linetransformer').draggable('enable');
			} else {
				$('#linetransformer').draggable('disable');
			}
			that.myFadeOut($('.loading'));
			that.myFadeIn(that.JC3, 1000);
			$('#overallbackground').removeClass('grid1');
			//focusOnC3会导致C3居中
			that.focusOnC3();
			//scrollToLastPosition in loadTemplateDoc
			that.scrollToLastPosition(that.tplid);
			that.C3.dispatchEvent(that.refreshC3Event);

			KFKclass.show(that.JC3);
			if (that.docIsReadOnly()) {
				$('#leftPanel').addClass('noshow');
				$('#minimap').addClass('noshow');
				that.myFadeOut($('#leftPanel'), 500);
			} else {
				$('#leftPanel').removeClass('noshow');
				$('#minimap').removeClass('noshow');
				that.myFadeIn($('#leftPanel'), 1000);
			}
		} catch (err) {
			console.error(err);
		} finally {
			that.addDocumentEventHandler();
			that.inited = true;
			that.showHelp('To see node properties, press P then click on a node', 10000);
			KFK.C3GotFocus();
		}
	}

	async resetWorkflowStatusClasses(statusObj) {
		let that = this;
		for (let i = 0; i < statusObj.nodeStatus.length; i++) {
			const jqNode = that.JC3.find('#' + statusObj.nodeStatus[i].nodeid);
			KFK.replaceSTClassTo(jqNode, statusObj.nodeStatus[i].status);
		}

		that.JC3.find('.work').remove();
		let works = $(statusObj.doc).first('.workflow').find('.work');
		for (let i = 0; i < works.length; i++) {
			const aWork = $(works[i]);
			const theGuiNode = that.JC3.find('#' + aWork.attr('nodeid'));
			theGuiNode.append(aWork);
		}
		//console.log(statusObj.routeStatus);
		await that.setConnectionStatusColor(statusObj.routeStatus);
	}

	replaceSTClassTo(jqObj, newClassName) {
		try {
			let old_classes = jqObj.attr('class').split(/\s+/);
			old_classes.map((x) => (x.startsWith('ST_') ? jqObj.removeClass(x) : ''));
			jqObj.addClass(newClassName);
		} catch (err) {}
	}

	getSTClass(jqObj) {
		let old_classes = jqObj.attr('class').split(/\s+/);
		let tmp = old_classes.filter((x) => x.startsWith('ST_'));
		if (tmp.length > 0) return tmp[0];
		else return '';
	}

	async addMobileHandler(guiNodes) {
		let that = this;
		//if (!that.isMobile) return;
		for (let i = 0; i < guiNodes.length; i++) {
			let kfkClass = that.getKfkClass($(guiNodes[i]));
			if (['AND', 'OR', 'START', 'END', 'GROUND', 'THROUGH'].includes(kfkClass)) {
				continue;
			}
			$(guiNodes[i]).append(
				`<div class='mobilehandler m-0 p-0 inline-block text-center'><i class="align-top text-center bi bi-arrow-up-right-circle"/></div>`
			);
			$(guiNodes[i]).find('.mobilehandler').off('click');
			$(guiNodes[i])
				.find('.mobilehandler')
				.on('click', async () => {
					await that.showNodeProperties($(guiNodes[i]));
				});
		}
	}

	async addNodeIdDIV(guiNodes) {
		let that = this;
		//if (!that.isMobile) return;
		for (let i = 0; i < guiNodes.length; i++) {
			let kfkClass = that.getKfkClass($(guiNodes[i]));
			if (['AND', 'OR', 'START', 'END', 'GROUND', 'THROUGH'].includes(kfkClass)) {
				continue;
			}
			$(guiNodes[i]).append(
				`<div class='nodeidlabel ${
					that.showNodeId ? '' : 'nodisplay'
				} m-0 p-0 inline-block text-center'>${$(guiNodes[i]).attr('id')}</div>`
			);
		}
	}

	async showNodeIdDIV(flag) {
		let that = this;
		that.showNodeId = flag;
		if (flag) {
			that.JC3.find('.nodeidlabel').removeClass('nodisplay');
		} else {
			that.JC3.find('.nodeidlabel').addClass('nodisplay');
		}
	}

	async onCtrlDown() {
		let that = this;
	}
	async onCtrlUp() {
		let that = this;
	}

	/**
	 * @type {}
	 */
	async loadWorkflowDoc(wfobj: any, routeStatus: any[]) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.theWf = wfobj;
		that.wfid = wfobj.wfid;
		await that.cleanupJC3();
		// clear以后，所有的球都可以正常运行了。
		// 之前没有这句话，导致workflow状态下的ball只有在刷新页面后才能正常。
		// template模式下，有这句话，所以总是正常显示球的运动
		that.tmpBalls.clear();
		that.template = null;
		that.setTool('POINTER');
		try {
			$('#leftPanel').addClass('noshow');
			$('#minimap').addClass('noshow');
			that.myFadeOut($('#leftPanel'), 500);
			KFKclass.hide(that.JC3);
			//eslint-disable-next-line
			that.tpl = $(wfobj.doc).first('.template');
			//theTplObject = $(wfobj.doc).first('.template');
			const nodes = that.tpl.find('.node');
			nodes.addClass('kfknode');
			await that.JC3.append(nodes);
			const guiNodes = that.JC3.find('.node');
			await that.addMobileHandler(guiNodes);
			await that.addNodeIdDIV(guiNodes);
			//在上面的that.JC3.append(nodes) 以后，
			//会导致that.tpl变空（对一个包含很多节点的模板，会变空 .node
			//和.link全部会丢失，当节点不多时，.node没有了，.link还在）
			//所以，必须用下面这句话重新读取workflow中的.template，解析后复制给that.tpl
			//这地方很奇怪，似乎跟JC3.append有关，append会从tpl中抽走对象？又不是完全抽走？什么机制？
			that.tpl = $(wfobj.doc).first('.template');
			let setDrag = false;
			for (let i = 0; i < guiNodes.length; i++) {
				const jqNode = $(guiNodes[i]);
				await that.setNodeEventHandler(jqNode, null, setDrag);
				await that.redrawLinkLines(jqNode, 'loadWorkflowDoc');
			}

			//eslint-disable-next-line
			that.workflow = $(wfobj.doc).first('.workflow');
			const works = that.workflow.find('.work');
			for (let i = 0; i < works.length; i++) {
				const aWork = $(works[i]);
				const theNodeid = aWork.attr('nodeid');
				const theGuiNode = that.JC3.find('#' + theNodeid);
				const classes = aWork.attr('class').split(/\s+/);
				for (let j = 0; j < classes.length; j++) {
					if (classes[j].startsWith('ST_')) {
						theGuiNode.addClass(classes[j]);
					}
				}
				theGuiNode.append(aWork);
			}

			/*
			for (let i = 0; i < guiNodes.length; i++) {
				//let jqNode = $(guiNodes[i]);
				//Add node className by it's running status in process
				//Change link line style by it's status
			}
			*/
			let connectionNumber = await that.setConnectionStatusColor(routeStatus);

			that.myFadeOut($('.loading'));
			that.myFadeIn(that.JC3, 1000);
			$('#overallbackground').removeClass('grid1');

			//focusOnC3会导致C3居中
			that.focusOnC3();
			that.scrollToLastPosition(that.wfid);
			that.C3.dispatchEvent(that.refreshC3Event);
		} catch (err) {
			console.error(err);
		} finally {
			that.inited = true;
			KFK.C3GotFocus();
		}
	}

	scrollToLastPosition(objid: string) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		let docPos = {};
		//从localStorage中读取docPos记录
		const scrollPositionCache = localStorage.getItem('docPos');
		if (scrollPositionCache) {
			docPos = JSON.parse(scrollPositionCache);
		}
		//如果有当前文档的滚动位置记录，则滚动到起位置去
		if (docPos[objid]) {
			that.scrollToPos(docPos[objid]);
		} else {
			//如果没有，则滚动到第一屏
			that.scrollToPos({
				x: that.LeftB,
				y: that.TopB
			});
		}
	}

	scrollToFirstPage() {
		const that = this;
		that.scrollToPos({
			x: that.LeftB,
			y: that.TopB
		});
	}

	scrollToStartNode() {
		const that = this;
		let startNode = that.JC3.find('.START').first();
		if (startNode) {
			let thePos = {
				x: KFKclass.unpx(startNode.css('left')) + that.LeftB - that.bestViewLeft,
				y: KFKclass.unpx(startNode.css('top')) + that.TopB - that.bestViewTop
			};
			console.log(thePos);
			that.scrollToPos(thePos);
		} else {
			that.scrollToFirstPage();
		}
	}

	scrollToPos(pos: Point) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.JS1.scrollLeft(pos.x);
		that.JS1.scrollTop(pos.y);
	}

	initLeftRightPanelEventHandler() {
		$('#leftPanel').on('click', function (evt) {
			evt.stopPropagation();
		});
		//topPropgation will stop click on C1 and C3, or else, C3 will jump after move mouse from designer-topMenu to C1
		$('#designer-topMenu').on('click', function (evt) {
			evt.stopPropagation();
		});
		$('#leftPanel').on('mousedown', function (evt) {
			evt.stopPropagation();
		});
		$('#designer-topMenu').on('mousedown', function (evt) {
			evt.stopPropagation();
		});
	}

	onToolboxMouseDown(tool: string) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.toolboxMouseDown = true;
		that.tool = tool;
	}

	onToolboxMouseUp() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.toolboxMouseDown = false;
	}

	async showSection(options: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const section = $.extend({}, that.APP.show.section, options);
		that.APP.setData('show', 'section', section);
	}

	async showForm(options: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const form = $.extend({}, that.APP.show.form, options);
		that.APP.setData('show', 'form', form);
	}

	async showDialog(options: { pasteContentDialog: boolean }) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const dialog = $.extend({}, that.APP.show.dialog, options);
		that.APP.setData('show', 'dialog', dialog);
	}
	mergeAppData(data: any, key: string, value: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (typeof data === 'string' && typeof key === 'string' && typeof value === 'object') {
			const tmpData = $.extend({}, that.APP[data][key], value);
			that.APP.setData(data, key, tmpData);
		} else if (typeof data === 'string' && data.indexOf('.') > 0 && typeof key === 'object') {
			const arr = data.split('.');
			const tmpData = $.extend({}, that.APP[arr[0]][arr[1]], key);
			that.APP.setData(arr[0], arr[1], tmpData);
		}
	}

	async sleep(miliseconds: number) {
		await new Promise((resolve) => setTimeout(resolve, miliseconds));
	}

	getProductUrl() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		// return cocoConfig.product.url;
		return that.urlBase;
	}

	async cleanupJC3() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		await that.JC3.empty();
		that.addSvgLayer();
	}

	getLineOptions(div: JQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return JSON.parse(that.base64ToCode(div.attr('options')));
	}
	setLineOptions(div: JQuery, options: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		div.attr('options', that.codeToBase64(JSON.stringify(options)));
	}

	getPropertyApplyToShape() {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.hoverSvgLine() != null) {
			return that.hoverSvgLine();
		} else if (that.pickedShape != null) {
			return that.pickedShape;
		} else if (that.justCreatedShape != null) {
			return that.justCreatedShape;
		} else {
			return null;
		}
	}

	resetShapeStyleToOrigin(shape: any) {
		shape.attr({
			'stroke-width': shape.attr('origin-width'),
			stroke: shape.attr('origin-color')
		});
	}

	resetTmpTool() {
		if (KFK.tmpTool) {
			KFK.setTool(KFK.tmpTool);
			KFK.tmpTool = null;
		}
	}

	addDocumentEventHandler(force = false) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.documentEventHandlerSet && force === false) {
			return;
		}
		//document keydown
		//eslint-disable-next-line
		$(document).keydown(async function (evt) {
			if (evt === that.lastEvt) return;
			that.lastEvt = evt;
			if (that.isShowingModal === true) return;
			if (that.onC3 === false) {
				console.log('onC3 = false');
				return;
			}
			if (that.isEditting) return;
			if (evt.key === 'Shift') {
				that.KEYDOWN.shift = true;
				if (that.tool !== 'POINTER') {
					console.log('shift down');
					that.tmpTool = that.tool;
					that.setTool('POINTER');
				}
			} else if (evt.key === 'Control') {
				that.KEYDOWN.ctrl = true;
				await that.onCtrlDown();
			} else if (evt.key === 'Alt') that.KEYDOWN.alt = true;
			else if (evt.key === 'Meta') that.KEYDOWN.meta = true;
			//如果正处于编辑状态，则不做处理
			//禁止Ctrl-A  and Ctrl-S
			if ((evt.key === 'a' || evt.key === 's') && (evt.ctrlKey || evt.metaKey)) {
				evt.stopPropagation();
				evt.preventDefault();
				if (evt.key === 'a') {
					console.log('Select all');
					KFK.selectAllNode();
				}
				return;
			}
			//key pool
			if (
				'0123456789abcdefghijklmnopqrstuvwxyz'.indexOf(evt.key) >= 0 ||
				evt.key === ' ' ||
				evt.key === ';'
			) {
				that.keypool += evt.key;
				that.keypool = that.keypool.toLowerCase();
				await that.procKeypool(evt);
			} else {
				that.keypool = '';
			}

			switch (evt.key) {
				case 'z': //key z
					//不要移动META-Z代码，一定要在document的key-down里面，
					//否则，在其他地方没有用。这个问题花了我三个小时时间，FX
					if ((evt.metaKey || evt.ctrlKey) && evt.shiftKey) {
						that.logKey('META-SHIFT-Z');
						await that.redo();
					}
					if ((evt.metaKey || evt.ctrlKey) && !evt.shiftKey) {
						that.logKey('META-Z');
						await that.undo();
					}
					break;
				case 'y':
					if ((evt.metaKey || evt.ctrlKey) && !evt.shiftKey) {
						that.logKey('META-Y');
						await that.redo();
					}
					break;
				case 'Escape':
					that.onESC();
					break;
				case '1':
					that.setTool('ACTION', evt);
					break;
				case '2':
					that.setTool('INFORM', evt);
					break;
				case '3':
					that.setTool('SCRIPT', evt);
					break;
				case '4':
					that.setTool('TIMER', evt);
					break;
				case '5':
					that.setTool('SUB', evt);
					break;
				case '6':
					that.setTool('AND', evt);
					break;
				case '7':
					that.setTool('OR', evt);
					break;
				case '8':
					that.setTool('GROUND', evt);
					break;
				case '9':
					that.setTool('CONNECT', evt);
					break;
				case '0':
					that.setTool('THROUGH', evt);
					break;
				case 'Backspace':
				case 'Delete':
					that.deleteObjects(evt, false);
					break;
				case 'r':
					//that.scrollToFirstPage();
					that.scrollToStartNode();
					break;
				default:
					break;
			}
		});
		//eslint-disable-next-line
		$(document).keyup(async function (evt) {
			switch (evt.key) {
				case 'Shift':
					that.KEYDOWN.shift = false;
					if (that.tmpTool) {
						that.setTool(that.tmpTool);
						that.tmpTool = null;
					}
					break;
				case 'Control':
					that.KEYDOWN.ctrl = false;
					await that.onCtrlUp();
					//that.stopZoomShape();
					break;
				case 'Alt':
					that.KEYDOWN.alt = false;
					break;
				default:
					break;
			}
		});

		//标记框选开始，是在JC3的mousedown中做记录的
		//标记框选结束，也是在JC3的mouseup中做记录的
		//但mousemove需要在document的mousemove事件处理中进行处理。
		//因为，如果不这样做，滑动鼠标出现选择框后，如果鼠标回到选择框内，则JC3抓不到mousemove事件
		//导致的现象就是选择框只可以放大，不可以缩小
		$(document).on('mousemove', function (evt) {
			that.globalMouseX = evt.clientX;
			that.globalMouseY = evt.clientY;
			that.designerCallback('updateCheckOnMousemove', that.template);
			if (that.inPresentingMode || that.inOverviewMode) return;
			if (that.inNoteEditor) return;
			if (!that.onC3) return;
			const tmp = {
				x: that.scrXToJc3X(evt.clientX),
				y: that.scrYToJc3Y(evt.clientY)
			};
			if (that.isDuringKuangXuan()) {
				that.kuangXuan(that.kuangXuanStartPoint, tmp);
				/*
		} else if (that.isZoomingShape) {
			that.zoomShape(evt, that.shapeToZoom);
			*/
			} else if (
				that.panStartAt &&
				KFKclass.NotSet(that.shapeToDrag) &&
				that.isEditting === false &&
				that.isShowingModal === false &&
				that.lineTransfomerDragging !== true
			) {
				const delta = {
					x: evt.clientX - that.panStartAt.x,
					y: evt.clientY - that.panStartAt.y
				};
				that.JS1.scrollLeft(that.JS1.scrollLeft() - delta.x * 2);
				that.JS1.scrollTop(that.JS1.scrollTop() - delta.y * 2);
				that.panStartAt.x = evt.clientX;
				that.panStartAt.y = evt.clientY;
				return;
			}
		});
		$(document).on('mousedown', function (evt) {
			if (that.tool === 'POINTER') {
				if (that.ctrlMouseToPan === true) {
					if (evt.shiftKey) {
						that.panStartAt = {
							x: evt.clientX,
							y: evt.clientY
						};
					} else {
						that.kuangXuanMouseIsDown = true;
						that.kuangXuanStartPoint = {
							x: that.scrXToJc3X(evt.clientX),
							y: that.scrYToJc3Y(evt.clientY)
						};
					}
				} else {
					if (evt.shiftKey) {
						that.kuangXuanMouseIsDown = true;
						that.kuangXuanStartPoint = {
							x: that.scrXToJc3X(evt.clientX),
							y: that.scrYToJc3Y(evt.clientY)
						};
					} else {
						that.panStartAt = {
							x: evt.clientX,
							y: evt.clientY
						};
					}
				}
			}
		});
		$(document).on('mouseup', async function (evt) {
			that.panStartAt = undefined;
			if (that.tool === 'POINTER') {
				that.kuangXuanMouseIsDown = false;
				that.kuangXuanEndPoint = {
					x: that.scrXToJc3X(evt.clientX),
					y: that.scrYToJc3Y(evt.clientY)
				};
				if (that.duringKuangXuan) {
					that.ignoreClick = true;
					that.endKuangXuan(that.kuangXuanStartPoint, that.kuangXuanEndPoint, evt.metaKey);
					that.duringKuangXuan = false;
				}
			}
			//线条点下去以后，shapeToDrag就设置好了
			//移动距离大于5时，才会设置shapeDragging=true
			//如果在距离小于5内，抬起鼠标，此时，shapeDragging还是false,此时，应该把shapeToDrag置为null
			if (that.shapeDragging === false && that.shapeToDrag) {
				that.shapeToDrag = null;
			}
			//end shape drag, end drag shape
			if (
				that.shapeDragging &&
				that.docIsReadOnly() === false &&
				that.lineLocked(that.shapeToDrag) === false
			) {
				if (that.isShapeSelected(that.shapeToDrag) === false && that.selectedShapes.length > 0) {
					that.cancelAlreadySelected();
				}
				const realX = that.scalePoint(that.scrXToJc3X(evt.clientX));
				const realY = that.scalePoint(that.scrYToJc3Y(evt.clientY));
				const pt = {
					x: realX,
					y: realY
				};
				// if (that.APP.model.viewConfig.snap) {
				//     pt = that.getNearGridPoint(realX, realY);
				// }
				let alreadySelected = false;
				for (let i = 0; i < that.selectedShapes.length; i++) {
					if (that.selectedShapes[i].attr('id') == that.shapeToDrag.attr('id')) {
						alreadySelected = true;
						break;
					}
				}
				if (alreadySelected === false) {
					that.selectedShapes.push(that.shapeToDrag);
				}
				let unlockedShapeCount = 0;
				for (let i = 0; i < that.selectedShapes.length; i++) {
					if (that.lineLocked(that.selectedShapes[i]) === false) {
						unlockedShapeCount++;
					}
				}
				let unlockedDivCount = 0;
				for (let i = 0; i < that.selectedDIVs.length; i++) {
					if (
						that.anyLocked(that.selectedDIVs[i]) === false &&
						that.updateable(that.selectedDIVs[i])
					) {
						unlockedDivCount++;
					}
				}
				//eslint-disable-next-line @typescript-eslint/no-unused-vars
				const movedCount = unlockedDivCount + unlockedShapeCount;
				let movedSer = 0;
				that.startTrx();
				try {
					for (let i = 0; i < that.selectedShapes.length; i++) {
						const aShape = that.selectedShapes[i];
						if (that.lineLocked(aShape)) continue;
						that.setShapeToRemember(aShape);
						//在拖动鼠标时， shapeDraggingStartPoint 是跟着变化的,在鼠标移动时，已经对shapeToDrag做了位移
						if (aShape.attr('id') === that.shapeToDrag.attr('id')) {
							const deltaX = pt.x - that.shapeDraggingStartPoint.x;
							const deltaY = pt.y - that.shapeDraggingStartPoint.y;
							await aShape.dmove(deltaX, deltaY);
						} else {
							//其它对象要从原始位置计算位移
							const deltaX = pt.x - that.shapeFirstDraggingStartPoint.x;
							const deltaY = pt.y - that.shapeFirstDraggingStartPoint.y;
							await aShape.dmove(deltaX, deltaY);
						}
						const beforeSaveWidth = aShape.attr('stroke-width');
						const beforeSaveColor = aShape.attr('stroke');
						that.resetShapeStyleToOrigin(aShape);
						that.resetShapeStyleToOrigin(that.shapeToRemember);
						movedSer = movedSer + 1;
						aShape.attr({
							'stroke-width': beforeSaveWidth,
							stroke: beforeSaveColor
						});
					}

					const delta = {
						x: pt.x - that.shapeFirstDraggingStartPoint.x,
						y: pt.y - that.shapeFirstDraggingStartPoint.y
					};
					for (let i = 0; i < that.selectedDIVs.length; i++) {
						if (
							that.anyLocked(that.selectedDIVs[i]) ||
							that.updateable(that.selectedDIVs[i]) === false
						)
							continue;
						//const tmpFromJQ = that.selectedDIVs[i].clone();
						//虽然这出跳过了被拖动的节点，但在后面这个节点一样要被移动
						//因此，所有被移动的节点数量就是所有被选中的节点数量
						that.selectedDIVs[i].css('left', that.divLeft(that.selectedDIVs[i]) + delta.x);
						that.selectedDIVs[i].css('top', that.divTop(that.selectedDIVs[i]) + delta.y);
						movedSer = movedSer + 1;
					}
					for (let i = 0; i < that.selectedDIVs.length; i++) {
						await that.redrawLinkLines(that.selectedDIVs[i], 'codrag', 'both');
					}
				} finally {
					that.endTrx();
				}

				that.setShapeToRemember(that.shapeToDrag);
				that.shapeDragging = false;
				that.shapeToDrag = null;
				$(document.body).css('cursor', 'default');
			}
		});

		// onscroll onScroll on scroll on Scroll
		//eslint-disable-next-line
		$('#S1').scroll(() => {
			const sx = $('#S1').scrollLeft();
			const sy = $('#S1').scrollTop();
			try {
				//不是每次滚动都记录，滚动停止一秒后再记录
				if (that.scrollPosTimer) {
					clearTimeout(that.scrollPosTimer);
					that.scrollPosTimer = undefined;
				}
				that.scrollPosTimer = setTimeout(function () {
					let docPos = {};
					const scrollPositionCache = localStorage.getItem('docPos');
					if (scrollPositionCache) {
						docPos = JSON.parse(scrollPositionCache);
					}
					if (docPos[that.tplid]) {
						docPos[that.tplid] = {
							x: sx,
							y: sy
						};
					} else {
						let keyCount = 0;
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						for (const _key in docPos) {
							keyCount++;
						}
						if (keyCount > 30) {
							const tmp = {};
							let j = 0;
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							for (const _key in docPos) {
								if (j > 10) {
									tmp[_key] = docPos[_key];
								}
								j++;
							}
							docPos = tmp;
						}
						docPos[that.tplid] = {
							x: sx,
							y: sy
						};
					}
					localStorage.setItem('docPos', JSON.stringify(docPos));
				}, 1000);
			} catch (error) {
				console.error('save docPos error', error);
			}
		});

		$(document).bind({
			copy: KFK.onCopy,
			paste: KFK.onPaste,
			cut: KFK.onCut
		});

		that.documentEventHandlerSet = true;
	}

	onESC() {
		//eslint-disable-next-line @typescript-eslint/no-this-alias, prefer-const
		let that = this;
		that.cancelAlreadySelected();
		if (that.tool === 'CONNECT') {
			that.cancelLinkNode();
		}
		if (!that.isEditting && that.tool !== 'line') that.setTool('POINTER');
		that.cancelTempLine();
		that.setTool('POINTER');
		if (that.tempShape) that.tempShape.hide();
		if (that.noCopyPaste) {
			that.noCopyPaste = false;
		}
		//that.scrollToFirstPage();
	}

	dataURLtoFile(dataurl: string, filename: string) {
		const arr: string[] = dataurl.split(',');
		const mime: any = arr[0].match(/:(.*?);/)[1];
		//eslint-disable-next-line
		const bstr: string = atob(arr[1]);
		let n: number = bstr.length;
		const u8arr: Uint8Array = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, {
			type: mime
		});
	}

	checkUrl(str_url: string) {
		const regex =
			/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/;
		return str_url.match(regex) !== null;
	}

	replaceHTMLTarget(html: string) {
		let ret: string = html;
		html = '<div>' + html + '</div>';
		try {
			const jq = $($.parseHTML(html));
			jq.find('a').prop('target', '_blank');
			jq.find('[style]').removeAttr('style');
			ret = jq.prop('innerHTML');
		} catch (err) {
			ret = '';
		}
		return ret;
	}

	async onCut(evt: Event | JQuery.KeyDownEvent<Document, null, Document, Document>) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = KFK;
		if (that.showingProp) return;
		if (that.hoverJqDiv()) {
			that.clipboardNode = that.hoverJqDiv();
		}
		if (that.hoveredConnectId) {
			that.clipboardConnectText = $(`.${that.hoveredConnectId}`).attr('case');
			if (Parser.isEmpty(that.clipboardConnectText)) {
				that.clipboardConnectText = null;
			}
		}
		that.deleteObjects(evt, false);
	}

	/**
	 * 复制对象
	 */
	async duplicateHoverObject(evt: MouseEvent, action = undefined) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (that.docIsReadOnly()) {
			return;
		}
		if (action === 'copy') {
			if (that.selectedDIVs.length > 1) {
				//优先多选
				//过滤掉TODOLISTDIV/chatmessage 等nocopy DIV
				const filteredDIVs = that.selectedDIVs.filter((div) => {
					return div.hasClass('nocopy') === false;
				});
				that.copyCandidateDIVs = filteredDIVs.map((div) => {
					const jTemp = div.clone();
					const jTitle = jTemp.find('.coco_title');
					if (jTitle.length > 0) {
						jTitle.text(jTitle.text() + '的复制');
					}
					return jTemp;
				});
				return true;
			} else if (that.getPropertyApplyToJqNode()) {
				//然后selected
				//过滤掉TODOLISTDIV
				if (that.getPropertyApplyToJqNode().hasClass('nocopy')) {
					that.copyCandidateDIVs = [];
					that.copyCandidateLines = [];
				} else {
					const jTemp = that.getPropertyApplyToJqNode().clone();
					const jTitle = jTemp.find('.coco_title');
					if (jTitle.length > 0) {
						jTitle.text(jTitle.text() + '的复制');
					}
					that.copyCandidateDIVs = [jTemp];
					that.copyCandidateLines = [];
				}
				return true;
			} else if (that.hoverSvgLine() && (action === undefined || action === 'copy')) {
				that.hoverSvgLine().attr({
					'stroke-width': that.hoverSvgLine().attr('origin-width')
				});
				that.copyCandidateLines = [that.hoverSvgLine().clone()];
				that.copyCandidateDIVs = [];
				return true;
			} else {
				return false;
			}
		} else if (action === 'paste') {
			if (that.copyCandidateDIVs && that.copyCandidateDIVs.length > 0) {
				await that.makeCopyOfJQs(that.copyCandidateDIVs, evt.shiftKey);
			} else if (that.copyCandidateLines && that.copyCandidateLines.length > 0) {
				await that.makeCopyOfLines(that.copyCandidateLines);
			}
			return true;
		}
		return true;
	}

	async copyNodes(evt) {
		console.log(KFK.selectedDIVs.length);
		return;
		if (KFK.selectedDIVs.length > 1) {
			//优先多选
			KFK.debug('multiple nodes were selected');
			//过滤掉TODOLISTDIV/chatmessage 等nocopy DIV
			let filteredDIVs = KFK.selectedDIVs.filter((div) => {
				return div.hasClass('nocopy') === false;
			});
			KFK.copyCandidateDIVs = filteredDIVs.map((div) => {
				let jTemp = div.clone();
				let jTitle = jTemp.find('.coco_title');
				if (jTitle.length > 0) {
					jTitle.text(jTitle.text() + '的复制');
				}
				return jTemp;
			});
			return true;
		} else if (KFK.getPropertyApplyToJqNode()) {
			//然后selected
			//过滤掉TODOLISTDIV
			if (KFK.getPropertyApplyToJqNode().hasClass('nocopy')) {
				KFK.copyCandidateDIVs = [];
				KFK.copyCandidateLines = [];
			} else {
				let jTemp = KFK.getPropertyApplyToJqNode().clone();
				let jTitle = jTemp.find('.coco_title');
				if (jTitle.length > 0) {
					jTitle.text(jTitle.text() + '的复制');
				}
				KFK.copyCandidateDIVs = [jTemp];
				KFK.copyCandidateLines = [];
			}
			return true;
		} else if (KFK.hoverSvgLine() && (action === undefined || action === 'copy')) {
			KFK.hoverSvgLine().attr({
				'stroke-width': KFK.hoverSvgLine().attr('origin-width')
			});
			KFK.copyCandidateLines = [KFK.hoverSvgLine().clone()];
			KFK.copyCandidateDIVs = [];
			// KFK.scrLog('对象已复制, 移动鼠标看所需位置再次按META-D或META-V安放')
			//下面这句代码在第一次按META-D时就粘贴了一条,有些不用,
			// await KFK.makeACopyOfLine(KFK.lineToCopy, evt.shiftKey);
			return true;
		} else {
			return false;
		}
	}

	async onCopy(evt: Event) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		let that = KFK;

		if (that.showingProp) return;

		//console.log(KFK.selectedDIVs.length);
		if (that.hoverJqDiv()) {
			that.clipboardNode = that.hoverJqDiv();
		}
		if (that.hoveredConnectId) {
			that.clipboardConnectText = $(`.${that.hoveredConnectId}`).attr('case');
			if (Parser.isEmpty(that.clipboardConnectText)) {
				that.clipboardConnectText = null;
			}
		}
		that.holdEvent(evt);
	}

	getKfkClass(jq) {
		let kfkClass = '';
		if (jq.hasClass('ACTION')) kfkClass = 'ACTION';
		else if (jq.hasClass('INFORM')) kfkClass = 'INFORM';
		else if (jq.hasClass('SCRIPT')) kfkClass = 'SCRIPT';
		else if (jq.hasClass('TIMER')) kfkClass = 'TIMER';
		else if (jq.hasClass('SUB')) kfkClass = 'SUB';
		else if (jq.hasClass('AND')) kfkClass = 'AND';
		else if (jq.hasClass('OR')) kfkClass = 'OR';
		else if (jq.hasClass('GROUND')) kfkClass = 'GROUND';
		else if (jq.hasClass('THROUGH')) kfkClass = 'THROUGH';
		else if (jq.hasClass('START')) kfkClass = 'START';
		else if (jq.hasClass('END')) kfkClass = 'END';
		return kfkClass;
	}

	setKfkClass(jq, kc) {
		let oldKc = KFK.getKfkClass(jq);
		jq.removeClass(oldKc);
		jq.addClass(kc);
	}

	validKfkClass() {
		return [
			'START',
			'END',
			'ACTION',
			'INFORM',
			'SCRIPT',
			'TIMER',
			'SUB',
			'AND',
			'OR',
			'GROUND',
			'THROUGH'
		];
	}

	async onPaste(evt: Event) {
		const that = KFK;
		if (KFK.docIsReadOnly()) {
			console.log('paste ignored since docIsReadOnly');
			return;
		}
		//如果当前是展示属性窗口，直接返回
		if (that.showingProp) return;
		//如果有connectText并且当前正在mouseover一个connectId，则设置当没connectId的文本
		if (that.clipboardConnectText && that.hoveredConnectId) {
			that.setConnectText($(`.${that.hoveredConnectId}`), that.clipboardConnectText);
			that.onChange('Paste connect');
		} else if (
			//如果贴了链接线，就不再贴节点
			that.clipboardNode &&
			//START 和 END节点不能被粘贴，因为只能有一个
			that.clipboardNode.hasClass('START') === false &&
			that.clipboardNode.hasClass('END') === false
		) {
			//if (that.hoverJqDiv()) {
			if (that.getPropertyApplyToJqNode()) {
				let pasteToJq = that.getPropertyApplyToJqNode();
				if (pasteToJq.hasClass('END') || pasteToJq.hasClass('START')) {
					console.log('paste to START/END not allowed');
				} else {
					console.log('paste hover node');
					let newNode = KFK.makeCloneDIV(that.clipboardNode, KFK.myuid(), {});
					pasteToJq.empty();
					newNode.children().each((_index: any, aChild: any) => {
						$(aChild).appendTo(pasteToJq);
					});
					KFK.setKfkClass(pasteToJq, KFK.getKfkClass(newNode));
				}

				//that.onChange('Paste node');
			} else {
				let newNode = KFK.makeCloneDIV(that.clipboardNode, KFK.myuid(), {
					left:
						KFK.scalePoint(KFK.scrXToJc3X(KFK.currentMousePos.x)) -
						KFK.divWidth(that.clipboardNode) * 0.5,
					top:
						KFK.scalePoint(KFK.scrYToJc3Y(KFK.currentMousePos.y)) -
						KFK.divHeight(that.clipboardNode) * 0.5
				});
				newNode.appendTo(KFK.C3);
				await KFK.setNodeEventHandler(newNode, async function () {});
				that.onChange('Paste node');
			}
		}
		that.holdEvent(evt);
	}

	endKuangXuan(pt1: Point, pt2: Point, metaKey: boolean) {
		pt1.x = KFK.scalePoint(pt1.x);
		pt1.y = KFK.scalePoint(pt1.y);
		pt2.x = KFK.scalePoint(pt2.x);
		pt2.y = KFK.scalePoint(pt2.y);

		let jqRect = $('#selectingrect');
		jqRect.hide();
		let rect = {
			left: Math.min(pt1.x, pt2.x),
			top: Math.min(pt1.y, pt2.y),
			width: Math.abs(pt1.x - pt2.x),
			height: Math.abs(pt1.y - pt2.y),
			right: 0,
			bottom: 0
		};
		rect.right = rect.left + rect.width;
		rect.bottom = rect.top + rect.height;
		if (rect.width < 10 && rect.height < 10) {
			//这里，如果滑动大小横向和纵向都小于10， 则不作为框选
			return;
		}

		if (metaKey === false) {
			while (KFK.selectedDIVs.length > 0) {
				KFK.deselectNode(KFK.selectedDIVs[0]);
			}
		}
		//为防止混乱，框选只对node div有效果
		KFK.JC3.find('.kfknode').each((index, div) => {
			let jqDiv = $(div);
			let divRect = KFK.divRect(jqDiv);
			if (
				rect.left < divRect.right &&
				rect.right > divRect.left &&
				rect.top < divRect.bottom &&
				rect.bottom > divRect.top
			) {
				KFK.selectNode(jqDiv);
			}
		});

		KFK.JC3.find('.kfkshape').each((index, shape) => {
			let svgShape = SVG(shape);
			let shapeRect = KFK.getShapeRect(svgShape);
			if (
				rect.left < shapeRect.right &&
				rect.right > shapeRect.left &&
				rect.top < shapeRect.bottom &&
				rect.bottom > shapeRect.top
			) {
				KFK.selectShape(svgShape);
			}
		});
	}

	scrCenter() {
		return {
			x: $(window).width() * 0.5,
			y: $(window).height() * 0.5
		};
	}

	printCallStack(msg = '') {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.info(new Error(msg).stack);
	}

	makePath(p1: Point, p2: Point) {
		const rad: number = 10;
		const c1: Point = {
			x: p2.x - rad,
			y: p1.y
		};
		const c2: Point = {
			x: p2.x,
			y: p1.y + rad
		};

		const pStr: string = `M${p1.x} ${p1.y} H${c1.x} S${c2.x} ${c1.y} ${c2.x} ${c2.y} V${p2.y}`;
		return pStr;
	}

	mouseOverConnect(theConnect: any) {
		let that = this;
		const styleid = theConnect.attr('styleid');
		const connect_color = that.YIQColorAux || that.config.connect.styles[styleid].hover.color;
		theConnect.stroke({
			width: that.config.connect.styles[styleid].hover.width,
			color: connect_color
		});
		that.ball.removeClass('noshow');
		that.ball.fill('#2726ff');
		const length = theConnect.length();
		//let runner_duration = 500 * length / 100;
		const runner_duration = 1500;
		const runner = that.ball.animate({ duration: runner_duration, when: 'now', times: 3 });
		runner.ease('>');
		runner
			.during(function (pos: any) {
				const p: Point = theConnect.pointAt(pos * length);
				that.ball.center(p.x, p.y);
			})
			.loop(true);
		that.hoveredConnectId = theConnect.attr('id');
		that.hoveredConnect = theConnect;
		that.onC3 = true;
	}
	mouseOutConnect(theConnect: any, cnWidth, cnColor) {
		let that = this;
		const styleid = theConnect.attr('styleid');
		that.ball.addClass('noshow');
		that.ball.timeline().stop();
		theConnect.stroke({
			width: cnWidth || that.config.connect.styles[styleid].normal.width,
			color: cnColor || that.YIQColorAux || that.config.connect.styles[styleid].normal.color
		});
		that.hoveredConnectId = null;
		that.hoveredConnect = null;
	}
	async mouseClickConnect(evt: MouseEvent, theConnect) {
		let that = this;
		if (evt.shiftKey) {
			if (theConnect.attr('fid') !== 'start') that.showConnectionProperties(theConnect);
			else {
				that.showHelp('Link from START is not configurable');
			}
		} else {
			await that.selectConnectOnClick(theConnect, evt);
		}
	}

	/**
	 * 画两个节点之间的连接线
	 *
	 * fid - 起始节点的ID
	 * tid - 终点节点的ID
	 * lineClass - 事实上是这条线的ID, 用于查找正向线(svgjs用class查找对象)
	 * lineCLassReverse - 反向线的class, 用于查找反向线
	 * pstr - 连接线的plot string
	 * triangle - 三角形的顶点坐标
	 */
	async _svgDrawNodesConnect(
		fid: string,
		tid: string,
		lineClass: string,
		lineClassReverse: string,
		pstr: string,
		lstr: string,
		_tstr: string,
		triangle: number[],
		caseValue: string,
		setValue: string,
		simpleLineMode: boolean = false
	) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		try {
			const drawPstr: boolean = !simpleLineMode;
			let theConnect: any = null;
			let theTriangle: any = null;
			const fromDIV: any = $(`#${fid}`);
			const toDIV: any = $(`#${tid}`);
			//在之前的cocopad的代码中，节点上添加了三个属性：cncolor, cnwidth, cnstyle, cn表示connection
			const cnColor = fromDIV.attr('cncolor');
			const cnWidth = fromDIV.attr('cnwidth');
			const cnStyle = fromDIV.attr('cnstyle');
			const reverseLine = that.svgDraw.findOne(`.${lineClassReverse}`);
			const oldLine = that.svgDraw.findOne(`.${lineClass}`);
			const oldText = that.svgDraw.findOne(`.${lineClass + '_text'}`);
			const reverseTriangle = that.svgDraw.findOne(`.${lineClassReverse}_triangle`);
			const oldTriangle = that.svgDraw.findOne(`.${lineClass}_triangle`);

			const theConnect_color =
				cnColor || that.YIQColorAux || that.config.connect.styles.style1.normal.color;
			const theConnect_width = cnWidth || that.config.connect.styles.style1.normal.width;
			const theConnect_fill_color = theConnect_color;
			//如果存在同一ID的线,则重画这条线及其三角
			if (oldText) {
				oldText.remove();
			}
			if (oldLine) {
				oldLine.plot(drawPstr ? pstr : lstr);
				oldTriangle && oldTriangle.plot(triangle);
				theConnect = oldLine;
				theTriangle = oldTriangle;
			} else {
				//如果不同在同一ID的线, then
				if (reverseLine) {
					//如果存在反向线,则重画这条反向线为正向线
					reverseLine.removeClass(lineClassReverse);
					reverseLine.addClass(lineClass);
					reverseLine.plot(drawPstr ? pstr : lstr);
					reverseTriangle.removeClass(lineClassReverse + '_triangle');
					reverseTriangle.addClass(lineClass + '_triangle');
					reverseTriangle.plot(triangle);
					theConnect = reverseLine;
					theTriangle = reverseTriangle;
				} else {
					//如果同向线和反向线都不存在,则画新线条及其三角. 反向线是指与从fromNode指向toNode的线反向相反的线,也就是从toNode指向fromNode的线
					theConnect = await that.svgDraw.path(drawPstr ? pstr : lstr);
					theConnect
						.addClass(lineClass)
						.addClass('connect')
						.attr('styleid', 'style1')
						.fill(drawPstr ? theConnect_fill_color : 'none')
						.stroke({
							width: theConnect_width,
							color: theConnect_color
						});

					if (drawPstr === false) {
						//填充时,边线为虚线可能会导致颜色溢出,待验证
						if (cnStyle === 'solid') {
							theConnect.css('stroke-dasharray', '');
						} else {
							theConnect.css('stroke-dasharray', `${cnWidth * 3} ${cnWidth}`);
						}
					}
					theConnect.attr({
						id: lineClass,
						'origin-width': that.APP.model.svg.connect.width
					});
					theTriangle = await that.svgDraw
						.polygon(triangle)
						.addClass(lineClass + '_triangle')
						.fill(theConnect_fill_color);
					/*
                .stroke({
                  width: that.APP.model.svg.connect.triangle.width,
                  color: cnColor || that.APP.model.svg.connect.triangle.color,
                });
                */
				}
			}
			theConnect.attr('case', caseValue);
			theConnect.attr('set', setValue);
			let caseDisplay = `${caseValue}${setValue ? '+++' : ''}`;
			const connectText = await that.svgDraw.text(function (add: any) {
				add.tspan(caseDisplay).dy(-2);
			});
			connectText.font({ family: 'Helvetica', anchor: 'start' });
			connectText.addClass(lineClass + '_text');
			connectText.path(lstr).attr('startOffset', '60%');
			if (toDIV.hasClass('nodisplay')) {
				theConnect.addClass('nodisplay');
				theTriangle.addClass('nodisplay');
			}
			theConnect.attr({
				fid: fid,
				tid: tid
			});
			theConnect.off('mouseover mouseout click');
			connectText.off('mouseover mouseout click');
			theConnect.on('mouseover', () => {
				that.mouseOverConnect(theConnect);
			});
			theConnect.on('mouseout', () => {
				that.mouseOutConnect(theConnect, cnWidth, cnColor);
			});
			//click line
			theConnect.on('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				that.mouseClickConnect(e, theConnect);
			});
			//click text
			connectText.on('mouseover', async (e) => {
				that.mouseOverConnect(theConnect);
			});
			connectText.on('mouseout', async (e) => {
				that.mouseOutConnect(theConnect, cnWidth, cnColor);
			});
			connectText.on('click', async (e) => {
				//click text
				e.preventDefault();
				e.stopPropagation();
				await that.mouseClickConnect(e, theConnect);
			});
		} catch (error) {
			console.error(error);
		}
	}

	async reloadNodeProp(nodeid) {
		let that = this;
		console.log('KFK reloadNodeProp', nodeid);
		let jqNodeDIV = that.JC3.find(`#${nodeid}`);
		await that.showNodeProperties(jqNodeDIV);
	}

	async onClickNode(evt: MouseEvent, jqNodeDIV) {
		let that = this;
		if (that.tool === 'POINTER') {
			if (evt.shiftKey) {
				await that.showNodeProperties(jqNodeDIV);
			} else {
				that.selectNodeOnClick(jqNodeDIV, evt.metaKey);
			}
		} else if (that.tool === 'CONNECT' && that.docIsReadOnly() === false) {
			if (that.afterDragging === false) {
				await that.yarkLinkNode(jqNodeDIV, evt.altKey);
			} else {
				that.afterDragging = true;
			}
			evt.stopImmediatePropagation();
			evt.stopPropagation();
			evt.preventDefault();
			return;
		} else {
			that.setTool('POINTER');
		}
	}

	svgDrawTmpLine(fx: number, fy: number, tx: number, ty: number, option: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		const tmpLineClass = 'shape_temp';

		//按着alt的话，需要画成垂直或水平线
		if (that.KEYDOWN.alt) {
			if (Math.abs(tx - fx) < Math.abs(ty - fy)) tx = fx;
			else ty = fy;
		}
		that.tempSvgLine = that.svgDraw.findOne(`.${tmpLineClass}`);
		if (that.tempSvgLine) {
			that.tempSvgLine.show();
			that.tempSvgLine.plot(fx, fy, tx, ty).stroke(option);
		} else {
			that.tempSvgLine = that.svgDraw.line(fx, fy, tx, ty).addClass(tmpLineClass).stroke(option);
		}
	}

	/**
	 * 画线
	 *
	 * @param {string} fid - 起始节点的ID
	 * @param {string} tid - 终点节点的ID
	 * @param {number} fbp - 起始节点上的连接点的编号,从0-3
	 * @param {number} tbp - 终点节点上的连接点的编号,从0-3
	 * @param {number} fx - 连接点1的x坐标
	 * @param {number} fy - 连接点1的y坐标
	 * @param {number} tx - 连接点2的x坐标
	 * @param {number} ty - 连接点2的y坐标
	 */
	async svgConnectNode(
		fid: string,
		tid: string,
		fbp: number,
		tbp: number,
		fx: number,
		fy: number,
		tx: number,
		ty: number,
		caseValue: string,
		setValue: string
	) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		if (!(fid && tid)) {
			return;
		}
		const fromDIV = $(`#${fid}`);
		const lineClass = `connect_${fid}_${tid}`;
		const lineClassReverse = `connect_${tid}_${fid}`;
		let pstr = '';
		let lstr = '';
		let tstr = '';
		let x = [0, 0, 0, 0];
		let y = [0, 0, 0, 0];
		const ctrls = [0.4, 0.5, 0.5, 0.6];
		let triangle = [];
		const rad = 20;
		const ww = 10;
		let tri = 10;
		if (fromDIV.attr('cnwidth')) tri = Math.max(parseInt(fromDIV.attr('cnwidth')) * 2, 10);
		const tri_half = tri * 0.5;
		const tri_height = 17.3;
		let tsx = tx,
			tsy = ty - tri_height;
		//算出箭头三角形的三个顶点的坐标
		switch (tbp) {
			case 0:
				tsx = tx - tri_height;
				tsy = ty;
				triangle = [tsx, tsy + tri_half, tx, ty, tsx, tsy - tri_half];
				break;
			case 1:
				tsx = tx;
				tsy = ty - tri_height;
				triangle = [tsx - tri_half, tsy, tx, ty, tsx + tri_half, tsy];
				break;
			case 2:
				tsx = tx + tri_height;
				tsy = ty;
				triangle = [tsx, tsy - tri_half, tx, ty, tsx, tsy + tri_half];
				break;
			case 3:
				tsx = tx;
				tsy = ty + tri_height;
				triangle = [tsx - tri_half, tsy, tx, ty, tsx + tri_half, tsy];
				break;
		}
		//画线不用画到重点，只需要画到三角形即可
		switch (tbp) {
			case 0:
				tx = tx - tri_height;
				break;
			case 1:
				ty = ty - tri_height;
				break;
			case 2:
				tx = tx + tri_height;
				break;
			case 3:
				ty = ty + tri_height;
				break;
		}
		let dis = 0;
		switch (fbp) {
			case 0:
				switch (tbp) {
					case 0:
						pstr = `M${fx} ${fy} C${fx - rad} ${fy} ${tx - rad} ${ty} ${tx} ${ty}`;
						break;
					case 1:
						pstr = `M${fx} ${fy} C${tx} ${fy} ${tx} ${ty} ${tx} ${ty}`;
						break;
					case 2:
						lstr = `M${fx} ${fy} C${tx} ${fy} ${fx} ${ty} ${tx} ${ty}`;
						tstr = `M${tx} ${ty} C${fx} ${ty} ${tx} ${fy} ${fx} ${fy}`;
						dis = Math.abs(tx - fx);
						if (ty >= fy) {
							x = [3, 2, 0, 1].map((x) => fx - dis * ctrls[x]);
						} else {
							x = [0, 1, 3, 2].map((x) => fx - dis * ctrls[x]);
						}
						pstr =
							`M${fx},${fy + ww} ` +
							`L${fx},${fy - ww} ` +
							`C${x[0]},${fy - ww} ` +
							`${x[1]},${ty} ` +
							`${tx},${ty} ` +
							`C${x[2]},${ty} ` +
							`${x[3]},${fy + ww} ` +
							`${fx},${fy + ww} z`;
						break;
					case 3:
						pstr = `M${fx} ${fy} C${tx} ${fy} ${tx} ${ty} ${tx} ${ty}`;
						break;
				}
				break;
			case 1:
				switch (tbp) {
					case 0:
						pstr = `M${fx} ${fy} C${fx} ${ty} ${tx} ${ty} ${tx} ${ty}`;
						break;
					case 1:
						pstr = `M${fx} ${fy} C${fx} ${ty - rad} ${tx} ${ty - rad} ${tx} ${ty}`;
						break;
					case 2:
						pstr = `M${fx} ${fy} C${fx} ${ty} ${tx} ${ty} ${tx} ${ty}`;
						break;
					case 3:
						lstr = `M${fx} ${fy} C${fx} ${ty} ${tx} ${fy} ${tx} ${ty}`;
						tstr = `M${tx} ${ty} C${tx} ${fy} ${fx} ${ty} ${fx} ${fy}`;
						dis = Math.abs(ty - fy);
						if (tx >= fx) {
							y = [3, 2, 0, 1].map((x) => fy - dis * ctrls[x]);
						} else {
							y = [0, 1, 3, 2].map((x) => fy - dis * ctrls[x]);
						}
						pstr =
							`M${fx + ww},${fy} ` +
							`L${fx - ww},${fy} ` +
							`C${fx - ww}, ${y[0]} ` +
							`${tx}, ${y[1]} ` +
							`${tx},${ty} ` +
							`C${tx}, ${y[2]} ` +
							`${fx + ww}, ${y[3]} ` +
							`${fx + ww},${fy} z`;
						break;
				}
				break;
			case 2:
				switch (tbp) {
					case 0:
						dis = Math.abs(tx - fx);
						lstr = `M${fx} ${fy} C${tx} ${fy} ${fx} ${ty} ${tx} ${ty}`;
						tstr = `M${tx} ${ty} C${tx} ${fy} ${fx} ${ty} ${fx} ${fy}`;
						if (ty >= fy) {
							x = [3, 2, 0, 1].map((x) => fx + dis * ctrls[x]);
						} else {
							x = [0, 1, 3, 2].map((x) => fx + dis * ctrls[x]);
						}
						pstr =
							`M${fx},${fy + ww} ` +
							`L${fx},${fy - ww} ` +
							`C${x[0]},${fy - ww} ` +
							`${x[1]},${ty} ` +
							`${tx},${ty} ` +
							`C${x[2]},${ty} ` +
							`${x[3]},${fy + ww} ` +
							`${fx},${fy + ww} z`;
						break;
					case 1:
						lstr = `M${fx} ${fy} C${tx} ${fy} ${tx} ${ty} ${tx} ${ty}`;
						tstr = `M${tx} ${ty} C${tx} ${ty} ${tx} ${fy} ${fx} ${fy}`;
						dis = Math.abs(tx - fx);
						if (ty >= fy) {
							x = [3, 2, 0, 1].map((x) => fx + dis * ctrls[x]);
						} else {
							x = [0, 1, 3, 2].map((x) => fx + dis * ctrls[x]);
						}
						pstr =
							`M${fx},${fy + ww} ` +
							`L${fx},${fy - ww} ` +
							`C${x[0]},${fy - ww} ` +
							`${tx},${ty} ` +
							`${tx},${ty} ` +
							`C${tx},${ty} ` +
							`${x[3]},${fy + ww} ` +
							`${fx},${fy + ww} z`;
						break;
					case 2:
						dis = Math.abs(tx - fx);
						lstr = `M${fx} ${fy} C${fx + rad} ${fy} ${tx + rad} ${ty} ${tx} ${ty}`;
						tstr = `M${tx} ${ty} C${tx + rad} ${ty} ${fx + rad} ${fy} ${fx} ${fy}`;
						if (ty >= fy) {
							x = [3, 2, 0, 1].map((x) => fx + dis * ctrls[x]);
						} else {
							x = [0, 1, 3, 2].map((x) => fx + dis * ctrls[x]);
						}
						pstr =
							`M${fx},${fy + ww} ` +
							`L${fx},${fy - ww} ` +
							`C${tx + rad},${fy - ww} ` +
							`${tx + rad},${ty} ` +
							`${tx},${ty} ` +
							`C${tx + rad},${ty} ` +
							`${tx + rad},${fy + ww} ` +
							`${fx},${fy + ww} z`;
						break;
					case 3:
						pstr = `M${fx} ${fy} C${tx} ${fy} ${tx} ${ty} ${tx} ${ty}`;
						break;
				}
				break;
			case 3:
				switch (tbp) {
					case 0:
						pstr = `M${fx} ${fy} C${fx} ${ty} ${tx} ${ty} ${tx} ${ty}`;
						break;
					case 1:
						lstr = `M${fx} ${fy} C${fx} ${ty} ${tx} ${fy} ${tx} ${ty}`;
						tstr = `M${tx} ${ty} C${tx} ${fy} ${fx} ${ty} ${fx} ${fy}`;
						dis = Math.abs(ty - fy);
						if (tx >= fx) {
							y = [3, 2, 0, 1].map((x) => fy + dis * ctrls[x]);
						} else {
							y = [0, 1, 3, 2].map((x) => fy + dis * ctrls[x]);
						}
						pstr =
							`M${fx + ww},${fy} ` +
							`L${fx - ww},${fy} ` +
							`C${fx - ww}, ${y[0]} ` +
							`${tx}, ${y[1]} ` +
							`${tx},${ty} ` +
							`C${tx}, ${y[2]} ` +
							`${fx + ww}, ${y[3]} ` +
							`${fx + ww},${fy} z`;
						break;
					case 2:
						pstr = `M${fx} ${fy} C${fx} ${ty} ${tx} ${ty} ${tx} ${ty}`;
						break;
					case 3:
						pstr = `M${fx} ${fy} C${fx} ${fy + rad} ${tx} ${ty + rad} ${tx} ${ty}`;
						break;
				}
				break;
		}
		await that._svgDrawNodesConnect(
			fid,
			tid,
			lineClass,
			lineClassReverse,
			pstr,
			lstr,
			tstr,
			triangle,
			caseValue,
			setValue,
			that.APP.model.viewConfig.simpleLineMode
		);
	}

	showHelp(msg, timeout = 4000) {
		this.helpArea.text(msg);
		this.myFadeIn(this.helpArea);
		if (this.closeHelpTimer) {
			clearTimeout(this.closeHelpTimer);
		}
		this.closeHelpTimer = setTimeout(() => {
			this.myFadeOut(this.helpArea);
		}, timeout);
	}
	myFadeIn(jq: JQuery, ms = 200) {
		jq &&
			jq
				.css({
					visibility: 'visible',
					opacity: 0.0
				})
				.animate(
					{
						opacity: 1.0
					},
					ms
				);
	}
	myFadeOut(jq: JQuery, ms = 200) {
		jq &&
			jq.animate(
				{
					opacity: 0.0
				},
				ms,
				function () {
					jq.css('visibility', 'hidden');
				}
			);
	}
	/**
	 * Is a div visible, visible means it has not 'noshow' class
	 */
	isShowing(jq: JQuery) {
		if (typeof jq === 'string') jq = $(jq);
		return jq.hasClass('noshow') === false;
	}

	/*
checkBrowser () {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
	const browser = Bowser.getParser(window.navigator.userAgent);
	let isValidBrowser = browser.satisfies({
		// or in general
		chrome: '>70',
		edge: '>70'
	});
	that.APP.setData('model', 'isValidBrowser', isValidBrowser);
	that.APP.setData('model', 'isNotValidBrowser', !isValidBrowser);
	that.APP.setData('model', 'osName', browser.getOSName(true));
	if (['ios', 'android'].indexOf(that.APP.model.osName) >= 0) {
		that.APP.model.isMobile = true;
		that.APP.model.isPC = false;
	} else {
		that.APP.model.isMobile = false;
		that.APP.model.isPC = true;
	}
}
*/

	getBuffer(fileData: any) {
		return function (resolve: any) {
			const reader = new FileReader();
			reader.readAsArrayBuffer(fileData);
			reader.onload = function () {
				const result = reader.result;
				if (result instanceof ArrayBuffer) {
					const arrayBuffer: ArrayBuffer = result;
					const bytes = new Uint8Array(arrayBuffer);
					resolve(bytes);
				} else {
					console.error('readAsArrayBuffer should not return string');
				}
			};
		};
	}

	onGotSTS(response: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.sts = response.credential;
		// that.uploadToQcloudCOS();
		/*
	if (response.stsFor === 'drop') {
		that.uploadFileToQcloudCOS(that.fileToUpload);
	} else if (response.stsFor === 'paste') {
		that.uploadFileToQcloudCOS(that.blobToPaste);
	}
	 */
	}

	async procPasteBlob(blob: Blob) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		that.blobToPaste = blob;
		/*
	await that.sendCmd('GETSTS', {
		stsFor: 'paste'
	});
	 */
	}

	/*
uploadFileToQcloudCOS (file) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
	let cos = new COS({
		getAuthorization: function (options, callback) {
			callback({
				TmpSecretId: that.sts.credentials.tmpSecretId, // 临时密钥的 tmpSecretId
				TmpSecretKey: that.sts.credentials.tmpSecretKey, // 临时密钥的 tmpSecretKey
				XCosSecurityToken: that.sts.credentials.sessionToken, // 临时密钥的 sessionToken
				StartTime: that.sts.startTime,
				ExpiredTime: that.sts.expiredTime
			});
		}
	});
	let fileId = that.myuid();
	let fileName = fileId + '.' + file.type.substr(file.type.indexOf('/') + 1);
	let fileKeyName = that.APP.model.cocouser.orgid + '/' + fileName;
	if (file.size > 1024 * 1024) {
		cos.sliceUploadFile(
			{
				Bucket: cocoConfig.cos.bucket,
				Region: cocoConfig.cos.region,
				Key: fileKeyName,
				Body: file,
				onTaskReady: function (tid) {
					that.TaskId = tid;
				},
				onHashProgress: function (progressData) {
					
				},
				onProgress: function (progressData) {
				
				}
			},
			async function (err, data) {
				if (err) {
					console.error('putObject got error:', err);
				} else {
					try {
						let imgUrl =
							'https://' +
							cocoConfig.cos.reverseproxy +
							data.Location.substr(data.Location.indexOf('/'));
						await that.makeImageDiv(fileId, that.dropAtPos.x, that.dropAtPos.y, imgUrl);
						await that.refreshMatLibForAll();
					} catch (error) {
						console.error(error);
					}
				}
			}
		);
	} else {
		cos.putObject(
			{
				Bucket: cocoConfig.cos.bucket, // Bucket 格式：test-1250000000
				Region: cocoConfig.cos.region,
				Key: fileKeyName,
				Body: file,
				onTaskReady: function (tid) {
					that.TaskId = tid;
				},
				onHashProgress: function (progressData) {
				},
				onProgress: function (progressData) {
				}
			},
			async function (err, data) {
				if (err) {
					console.error('putObject got error:', err);
				} else {
					try {
						let imgUrl =
							'https://' +
							cocoConfig.cos.reverseproxy +
							data.Location.substr(data.Location.indexOf('/'));
						await that.makeImageDiv(fileId, that.dropAtPos.x, that.dropAtPos.y, imgUrl);
						await that.refreshMatLibForAll();
					} catch (error) {
						console.error(error);
					}
				}
			}
		);
	}
}
*/

	getFrontEndUrl(obj: string) {
		return cocoConfig.frontend.url + '/' + obj;
	}

	getBossImageUrl(img: string) {
		return cocoConfig.frontend.url + '/boss/' + img;
	}

	/**
	 * 判断一个div是否存在
	 * @param div 可以是一个jqdiv对象，也可以是一个jqdiv的id
	 */
	nodeExist(div: string | JQuery) {
		//
		let jqObjById = null;
		if (typeof div === 'string') {
			jqObjById = $('#' + div);
		} else {
			jqObjById = $('#' + div.attr('id'));
		}
		if (jqObjById.length > 0) {
			return true;
		} else {
			return false;
		}
	}
	nodeNotExist(jqdiv: string | JQuery) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return !that.nodeExist(jqdiv);
	}
	//eslint-disable-next-line @typescript-eslint/no-unused-vars
	clickOnLeftPanel(_evt: MouseEvent) {
		return;
	}
	//eslint-disable-next-line @typescript-eslint/no-unused-vars
	clickOnRightPanel(_evt: MouseEvent) {
		return;
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	pmsOk(_cmd?: string, _obj?: any) {
		//eslint-disable-next-line  @typescript-eslint/no-this-alias
		const that = this;
		return that.docIsNotReadOnly();
	}
}
const KFK = new KFKclass();

/* document.onpaste = KFK.onPaste;
document.oncopy = KFK.onCopy;
document.oncut = KFK.onCut; */

export default KFK;
