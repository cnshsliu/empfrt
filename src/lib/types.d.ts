/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */

export interface SmtpDef {
	host: string;
	port: number;
	secure: boolean;
	username: string;
	password: string;
	from: string;
	error?: string;
	message?: string;
}

export interface User {
	userid: string;
	username: string;
	group: string;
	email: string;
	avatar: string;
	signature?: string;
	bio: string;
	ew: { email: boolean; wecom: boolean };
	ps: number;
	sessionToken: string;
	password?: string;
	extra?: {
		input_search?: string;
		filter_status?: string;
	};
	perms: unknown;
}
export interface Org {
	site: string;
	name: string;
	owner: string;
	css: string;
	logo: string;
	login_background: string;
	page_background: string;
	orgmode: boolean;
	feedsview: number;
	timezone: string;
	allowchecker: boolean;
	smtp: smtpDef;
	adminorg: boolean;
}

export interface Template {
	_id: string;
	tenant: string;
	pboat: string;
	endpoint: string;
	endpointmode: string;
	tplid: string;
	author: string;
	doc: string;
	createdAt: string;
	updatedAt: string;
	ins: boolean;
	allowdiscuss: boolean;
}

export interface Workflow {
	_id: string;
	pbo: [string];
	pboat: string;
	endpoint: string;
	endpointmode: string;
	wfid: string;
	tenant: string;
	wftitle: string;
	teamid: string;
	tplid: string;
	status: string;
	statusLabel: string;
	starter: string;
	starterCN: string;
	doc: string;
	createdAt: string;
	updatedAt: string;
	kvarsArr?: kvarDef[];
	attachments: any[];
	rehearsal: boolean;
	pnodeid?: string;
	pworkid?: string;
	cselector?: string[];
	kvars?: any;
	history?: any;
	commentCount: number;
	allowdiscuss: boolean;
}

export interface Work {
	_id: string;
	tenant: string;
	doer?: string;
	doerCN?: string;
	doer_string?: string;
	role?: string;
	tplid: string;
	wfid: string;
	todoid: string;
	nodeid: string;
	workid: string;
	cellInfo: string;
	title: string;
	status: string;
	kvars: unknown;
	kvarsArr: ArrayLike<kvarDef>;
	wfstatus: string;
	createdAt: string;
	updatedAt: string;
	instruct: string;
	rehearsal?: boolean;
	wfstarter?: string;
	wf: Workflow;
	revocable?: boolean;
	returnable?: boolean;
	options?: string[];
	doneby?: string;
	doneat?: date;
	comment?: string;
	comments?: any;
	routingOptions?: string;
	from_nodeid?: string;
	withsb?: boolean;
	withrvk?: boolean;
	withadhoc?: boolean;
	withcmt?: boolean;
	allowdiscuss: boolean;
	version: string;
}

export interface TmapEntry {
	uid: string;
	cn: string;
}

export interface Tmap {
	[k: string]: TmapEntry[];
}

export interface Team {
	_id: string;
	tenant: string;
	teamid: string;
	author: string;
	createdAt: string;
	updatedAt: string;
	tmap: Tmap;
}

export interface kvarDef {
	name: string;
	value: string | number | string[];
	display?: string | number | string[];
	type: InputType;
	label: string;
	placeholder?: string;
	breakrow: boolean;
	id: string;
	options?: string;
	required?: boolean;
	when?: string;
	cssClass?: string;
	hide?: string;
	ui?: string | string[];
	formula?: string;
	wrong_input?: string;
}
export interface KVarDefInput {
	name: string;
	value: string | number | string[];
	label: string;
	type?: string;
	breakrow?: boolean;
	placeholder?: string;
	required?: boolean;
	when?: string;
	id?: string;
	options?: string;
	coldef?: string;
	visi?: string;
	formula?: string;
	min?: number;
	max?: number;
	step?: number;
}

export interface KFKclass {
	setTool: (tool: string, evt?: any) => any;
	lastEvt: any;
	loadTemplateDoc: (template: any, tpl_mode: string) => any;
	reloadNodeProp: (nodeid: string) => any;
	designerCallback: any;
	addDocumentEventHandler: any;
	setConnectProperties: any;
}

export interface StateContext {
	getState: () => {
		page: number;
		pageSize: number;
		rows: any;
		filteredRows: any;
	};
	setPage: (_page: number) => {
		page: number;
	};
	setRows: (_rows: any) => any;
}

export interface radioOption {
	value: string;
	label: string;
}

export interface NodeInfo {
	nodeType: string;
	jqDiv: any;
	theConnect: any;
	caseValue: string;
	setValue: string;
	nodeProps: {
		kvarsArr: KVarDef[];
		label: string;
		ACTION?: any;
		SUB?: any;
		INFORM?: any;
		SCRIPT?: any;
		TIMER?: any;
	};
}

export interface NodePropJSON {
	subject: string;
	content: string;
	role: string;
	bot: { wecom: boolean };
	code: string;
	runmode: string;
	label: string;
	sub: string;
	byall: boolean;
	csv: string;
	withcsv: boolean;
	allowpbo: boolean;
	vote: string;
	vote_any: string;
	vote_failto: string;
	vote_percent: number;
	instruct: string;
	alone: boolean;
	transferable: boolean;
	sr: boolean;
	withsb: boolean;
	withrvk: boolean;
	withadhoc: boolean;
	withcmt: boolean;
	repeaton: string;
	cronrun: number;
	cronexpr: string;
}

export interface SearchResult {
	total: number;
	objs: any[];
}

export interface KFKError {
	statusCode: number;
	error: string;
	code: string;
	message: string;
}

export interface WhichTab {
	template: string;
	team: string;
	worklist: string;
	workflow: string;
	setting: string;
}
export interface WorkStatus {
	status: string;
}
export interface FilterPicks {
	wf?: any;
	todo?: any;
	tpl?: any;
	locale?: string;
	confirmlocale?: boolean;
	gotoUID?: string;
	tabs?: string;
	tabs2nd?: string;
	settingTab?: string;
	settingTab2nd?: string;
	try_with_teamid?: string;
	try_with_email?: string;
	try_with_wfid?: string;
	try_with_kvar?: string;
	tspan?: string;
	col_per_row?: any;
	pageSize?: number;
	showprocesstrack?: boolean;
	curve?: boolean;
	debug?: string;
}
export interface EmpResponse {
	error?: string;
	errMsg?: string;
	user?: Record;
	perm?: string;
	message?: string;
}
export interface OrgMember {
	member?: string;
	group: string;
	checked: boolean;
	email: string;
	username: string;
}
export interface OrgMembers {
	adminorg?: bollean;
	members: OrgMember[];
}
export interface oneArgFunc {
	(arg: any): any;
}
