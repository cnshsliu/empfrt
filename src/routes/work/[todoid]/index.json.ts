import * as api from '$lib/api';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function get({ params, locals }) {
	const token = locals.user && locals.user.sessionToken;
	const work = await api.post('work/info', { todoid: params.todoid }, token);

	return {
		body: work
	};
}
