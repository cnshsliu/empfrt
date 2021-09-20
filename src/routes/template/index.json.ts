import * as api from '$lib/api';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function get({ locals }) {
	const token = locals.user && locals.user.sessionToken;
	const templates = await api.post('template/search', {}, token);

	return {
		body: templates
	};
}
