import * as api from '$lib/api';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function get({ locals, params }) {
	const token: string = locals.user && locals.user.sessionToken;
	let doer = params.doer;
	if (doer === 'default') doer = locals.user && locals.user.email;
	const works = await api.post(
		'work/list',
		{ doer, filter: { status: 'ST_RUN', wfstatus: 'ST_RUN' } },
		token
	);

	return {
		body: works
	};
}
