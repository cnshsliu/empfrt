import * as api from '$lib/api';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function get({ params, locals }) {
	const token = locals.user && locals.user.sessionToken;
	const team = await api.post('team/read', {teamid: params.teamid}, token);

	return {
		body: team
	};
}
