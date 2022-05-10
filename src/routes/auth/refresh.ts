import * as api from '$lib/api';
import Parser from '$lib/parser';
import { respond } from './_respond';
export async function post({ params, request, locals }) {
	const token = locals.user.sessionToken;
	const ret = await api.post('session/refresh', {}, token);
	if (ret.user) {
		locals.user = Parser.codeToBase64(JSON.stringify(ret.user));
	}
	return respond(ret);
}
