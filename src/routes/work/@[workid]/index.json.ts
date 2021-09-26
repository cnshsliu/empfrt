import * as api from '$lib/api';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function get({ params, locals }) {
	const token = locals.user && locals.user.sessionToken;
	const work = await api.post('work/info', { workid: params.workid }, token);

	return {
		body: work
	};
}
