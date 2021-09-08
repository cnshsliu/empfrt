import * as api from '$lib/api';

export async function get({ params, locals }) {
	let token = locals.user && locals.user.sessionToken;
	const templates = await api.get('template/list', token);

	return {
		body: templates
	};
}
