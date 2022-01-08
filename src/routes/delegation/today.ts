import * as api from '$lib/api';
export async function post(request) {
	let ret = {};
	ret = await api.post('delegation/to/me/today', {}, request.locals.user.sessionToken);
	if (ret.error) {
		console.error(ret.error);
	}
	return {
		body: ret
	};
}
