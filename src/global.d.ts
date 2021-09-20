/// <reference types="@sveltejs/kit" />

import type {JSONValue} from "@sveltejs/kit/types/endpoint";

interface User {
	userid: string;
	username: string;
	email: string;
	avatar: string;
	bio: string;
	sessionToken: string;
};

interface Template {
	_id: string;
	tenant: string;
	tplid: string;
	author: string;
	doc: string;
	createdAt: string;
	updatedAt: string;
};

interface TmapEntry{
	uid:string;
	dname:string;
}

interface Tmap {
	[k:string]: TmapEntry[];
}

interface Team {
	_id: string;
	tenant: string;
	teamid:string;
	author: string;
	createdAt: string;
	updatedAt: string;
	tmap: Tmap;
};

interface Config {
	sort: {
		field: string;
		order: number;
	};
}

interface KFKclass{
	designerCallback: any;
}
