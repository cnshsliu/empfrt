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
		value: request.body.value,
		old_password: request.body.old_password
	};
	const ret = await api.post('account/profile/update', payload, token);
	if (ret.user) {
		request.locals.user = Parser.codeToBase64(JSON.stringify(ret.user));
	}
	return respond(ret);
}
