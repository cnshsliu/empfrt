import * as api from '$lib/api';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function get({ params, locals }) {
	const token = locals.user && locals.user.sessionToken;
	let payload = {};
	if (params.tplid && params.tplid !== 'null') payload = { tplid: params.tplid };
	const workflows = await api.post('workflow/search', payload, token);

	return {
		body: workflows
	};
}
