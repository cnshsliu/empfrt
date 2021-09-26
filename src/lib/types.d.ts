/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface Locals {
	userid: string;
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
	value: unknown;
	type: string;
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
	kvars: kvarDef[];
	wfstatus: string;
	createdAt: string;
	updatedAt: string;
}

export interface Config {
	sort: {
		field: string;
		order: number;
	};
}

export interface KFKclass {
	designerCallback: any;
}
