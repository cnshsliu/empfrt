import * as api from '$lib/api';
import { respond } from './_respond';

export async function post(request) {
	const user = request.body;

	// TODO individual properties
	//const body = await api.post('users', { user });
	const body = await api.post('account/register',  user);

	return respond(body);
}
