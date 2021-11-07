import * as api from '$lib/api';
import cookie from 'cookie';
import Parser from '$lib/parser';
import { respond } from './_respond';
import ErrorProcessor from '$lib/errorProcessor';
import { session } from '$app/stores';
export async function post(request) {
	let ret = await api.post('account/login', {
		email: request.body.email,
		password: request.body.password
	});
	if (ret.error) {
		console.error('auth/login', ret);
	}
	let headers = {};
	if (ret.user) {
		request.locals.user = Parser.codeToBase64(JSON.stringify(ret.user));
	}
	return respond(ret);
}
