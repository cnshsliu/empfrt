import * as api from '$lib/api';
import { respond } from './_respond';
import ErrorProcessor from '$lib/errorProcessor';

export async function post({ params, request }) {
	const user = await request.json();

	let ret = await api.post('account/register', user);

	return respond(ret);
}
