import * as api from '$lib/api';
import { respond } from './_respond';
import ErrorProcessor from '$lib/errorProcessor';

export async function post(request) {
	let ret = await api.post('account/login', {
		email: request.body.email,
		password: request.body.password
	});

	return respond(ret);
}
