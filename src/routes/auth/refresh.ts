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
	const ret = await api.post('session/refresh', {}, token);
	console.log('Return fromserver', ret);
	if (ret.user) {
		request.locals.user = Parser.codeToBase64(JSON.stringify(ret.user));
	}
	return respond(ret);
}
