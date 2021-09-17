/// <reference types="@sveltejs/kit" />

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


interface Config {
	sort: {
		field: string;
		order: number;
	};
}
