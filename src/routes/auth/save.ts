import * as api from '$lib/api';
import Parser from '$lib/parser';
import { respond } from './_respond';

export async function post(request) {
	if (!request.locals.user) {
		return {
			status: 401
		};
	}

	const token = request.locals.user.sessionToken;
	const payload = {
		email: request.body.email,
		username: request.body.username,
		password: request.body.password,
		ew: request.body.ew,
		old_password: request.body.old_password,
		avatar: request.body.avatar
	};
	const ret = await api.post('account/profile/update', payload, token);
	console.log('auth/save', payload);
	if (ret.user) {
		request.locals.user = Parser.codeToBase64(JSON.stringify(ret.user));
	}
	return respond(ret);
}
