import * as api from '$lib/api';
import { respond } from './_respond';

export async function post({ body: user, locals }) {
	console.log('in save post');
	if (!locals.user) {
		return {
			status: 401
		};
	}

	const token = locals.user.sessionToken;
	console.log('TOken', token);
	const body = await api.post(
		'account/profile/update',
		{
			email: user.email,
			username: user.username,
			password: user.password
		},
		token
	);

	return respond(body);
}
