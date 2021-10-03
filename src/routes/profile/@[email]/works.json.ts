import * as api from '$lib/api';

export async function get({ params, locals }) {
	const token = locals.user && locals.user.sessionToken;
	const works = await api.post('work/list', { doer: locals.user.email }, token);

	return {
		body: works
	};
}
