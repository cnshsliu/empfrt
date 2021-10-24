/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface Locals {
	userid: string;
}

export interface EmpResponse {
	error: Record;
	errMsg: sgring;
	user: Record;
}

export interface User {
	userid: string;
	username: string;
	email: string;
	avatar: string;
	bio: string;
	sessionToken: string;
}

export interface Template {
	_id: string;
	tenant: string;
	tplid: string;
	author: string;
	doc: string;
	createdAt: string;
	updatedAt: string;
}

export interface Workflow {
	_id: string;
	wfid: string;
	tenant: string;
	wftitle: string;
	teamid: string;
	tplid: string;
	status: string;
	starter: string;
	doc: string;
	createdAt: string;
	updatedAt: string;
}

export interface TmapEntry {
	uid: string;
	dname: string;
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
	type: InputType;
	label: string;
	placeholder: string;
	break: boolean;
	id: string;
	options: ArrayLike<string | number>;
}
export interface Work {
	_id: string;
	tenant: string;
	doer: string;
	tplid: string;
	wfid: string;
	nodeid: string;
	workid: string;
	title: string;
	status: string;
	kvars: unknown;
	kvarsArr: ArrayLike<kvarDef>;
	wfstatus: string;
	createdAt: string;
	updatedAt: string;
}

export interface KFKclass {
	designerCallback: any;
	addDocumentEventHandler: any;
}

export interface radioOption {
	value: string;
	label: string;
}
