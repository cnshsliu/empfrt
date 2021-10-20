import * as api from '$lib/api';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function get({ locals }) {
	const token: string = locals.user && locals.user.sessionToken;
	const teams = await api.post('team/search', {}, token);

	return {
		body: teams
	};
}
