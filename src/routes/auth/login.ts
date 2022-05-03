import * as api from '$lib/api';
//import cookie from 'cookie';
//import Parser from '$lib/parser';
import { respond } from './_respond';
//import ErrorProcessor from '$lib/errorProcessor';
//import { session } from '$app/stores';
export async function post({ request }) {
	const body = await request.json();
	let ret = await api.post('account/login', {
		email: body.email,
		password: body.password
	});
	if (ret.error) {
		console.error('auth/login', ret);
	}
	if (ret.perm) {
		request.locals.perm = ret.perm;
	}
	return respond(ret);
}
