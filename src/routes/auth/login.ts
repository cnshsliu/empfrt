import * as api from '$lib/api';
//import cookie from 'cookie';
//import Parser from '$lib/parser';
import { respond } from './_respond';
//import ErrorProcessor from '$lib/errorProcessor';
//import { session } from '$app/stores';
export async function post({ request, locals }) {
	const body = await request.json();
	const ret = await api.post('account/login', {
		email: body.email,
		password: body.password,
	});
	if (ret.error) {
		console.error('auth/login', ret);
	}
	if (ret.perm) {
		locals.perm = ret.perm;
	}
	return respond(ret);
}
