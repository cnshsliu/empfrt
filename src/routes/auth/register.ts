import * as api from '$lib/api';
import { respond } from './_respond';

export async function post(request) {
	const user = request.body;

	const body = await api.post('account/register', user);

	return respond(body);
}
