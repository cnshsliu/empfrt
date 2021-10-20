import * as api from '$lib/api';
import { respond } from './_respond';

export async function post(request) {
	const body = await api.post('account/login', {
		email: request.body.email,
		password: request.body.password
	});

	return respond(body);
}
