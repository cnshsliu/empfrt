/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */

export interface EmpResponse {
	error?: Record;
	errMsg?: sgring;
	user?: Record;
}
export interface EmpResponse {
	error?: Record;
	errMsg?: sgring;
	user?: Record;
}
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
	bio: string;
	ew: boolean;
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
	tplid: string;
	author: string;
	doc: string;
	createdAt: string;
	updatedAt: string;
	ins: boolean;
}

export interface Workflow {
	_id: string;
	pbo: [string];
	wfid: string;
	tenant: string;
	wftitle: string;
	teamid: string;
	tplid: string;
	status: string;
	statusLabel: string;
	starter: string;
	doc: string;
	createdAt: string;
	updatedAt: string;
	kvarsArr?: kvarDef[];
}

export interface Work {
	_id: string;
	tenant: string;
	doer: string;
	doer_string?: string;
	role?: string;
	tplid: string;
	wfid: string;
	todoid: string;
	nodeid: string;
	workid: string;
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
	value: string | number | string[] | boolean;
	type: InputType;
	label: string;
	placeholder?: string;
	breakrow: boolean;
	id: string;
	options?: string;
	required?: boolean;
}
export interface KvarInput {
	name: string;
	value: string | number | string[];
	label: string;
	type?: string;
	breakrow?: boolean;
	placeholder?: string;
	required?: boolean;
	id?: string;
	options?: string;
}

export interface KFKclass {
	setTool: (tool: string, evt?: any) => any;
	loadTemplateDoc: (template: any, tpl_mode: string) => any;
	designerCallback: any;
	addDocumentEventHandler: any;
	setConnectProperties: any;
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
	nodeProps: {
		kvarsArr: KvarInput[];
		label: string;
		ACTION?: any;
		SUB?: any;
	};
}

export interface NodePropJSON {
	subject: string;
	content: string;
	role: string;
	code: string;
	runmode: string;
	label: string;
	sub: string;
	byall: boolean;
	instruct: string;
	alone: boolean;
	transferable: boolean;
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
	wfStatus: string;
	workStatus: string;
	tplTag: string;
	tplid: string;
	doer: string;
	starter: string;
	author: string;
	locale: string;
	calendar_begin: string;
	calendar_end: string;
	workTitlePattern: string;
	wfTitlePattern: string;
	tplTitlePattern: string;
	gotoUID: string;
	workSorting: { dir: string; key: string };
	wfSorting: { dir: string; key: string };
	tplSorting: { dir: string; key: string };
	tabs: string;
	tabs2nd: string;
	settingTab: string;
	settingTab2nd: string;
	try_with_teamid?: string;
	try_with_email?: string;
	tspan: string;
	debug: string;
}
export interface EmpResponse {
	error?: Record;
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
