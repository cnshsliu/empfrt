import * as api from '$lib/api';

export async function get({ params, locals }) {
	let token = locals.user && locals.user.sessionToken;
	const template = await api.post('template/read', {tplid: params.tplid}, token);

	return {
		body: template
	};
}
