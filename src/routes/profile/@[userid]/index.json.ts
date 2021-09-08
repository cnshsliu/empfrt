import * as api from '$lib/api';

export async function get({ params, locals }) {
	let token = locals.user && locals.user.sessionToken;
	const profile = await api.get(`account/profile/id/${params.userid}`, token);

	return {
		body: profile
	};
}
