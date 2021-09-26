import * as api from '$lib/api';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function get({ params, locals }) {
	const token = locals.user && locals.user.sessionToken;
	const template = await api.post('template/read', { tplid: params.tplid }, token);

	return {
		body: template
	};
}
