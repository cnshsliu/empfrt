import * as api from '$lib/api';
import type { EmpResponse } from '$lib/types';
export async function post(request) {
	let ret = (await api.post(
		'delegation/from/me',
		{},
		request.locals.user.sessionToken
	)) as unknown as EmpResponse;
	if (ret.error) {
		console.error(ret.error);
	}
	return {
		body: ret
	};
}
