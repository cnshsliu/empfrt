import * as api from '$lib/api';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function get({ params, locals }) {
	const token = locals.user && locals.user.sessionToken;
	const workflow = await api.post('workflow/read', { wfid: params.wfid, withdoc: false }, token);

	return {
		body: workflow
	};
}
