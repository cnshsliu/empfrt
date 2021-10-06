import * as api from '$lib/api';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function get({ locals }) {
	const token = locals.user && locals.user.sessionToken;
	const workflows = await api.post('workflow/search', {}, token);

	return {
		body: workflows
	};
}
