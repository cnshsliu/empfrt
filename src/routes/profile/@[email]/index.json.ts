import * as api from '$lib/api';

export async function get({ params, locals }) {
	const token = locals.user && locals.user.sessionToken;
	const profile = await api.get(`account/profile/${params.email}`, token);

	return {
		body: profile
	};
}
