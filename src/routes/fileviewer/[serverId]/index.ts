import * as api from '$lib/api';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function get({ params, locals }) {
	let fileSaver = null;
	const token = locals.user && locals.user.sessionToken;
	console.log(token);
	let payload = {};
	if (params.serverId && params.serverId !== 'null') payload = { serverId: params.serverId };
	const content = await api.post('wf/attach/viewer', payload, token);

	return {
		headers: {
			'cache-control': 'no-cache',
			'content-type': 'image/png'
		},
		body: content
	};
}
