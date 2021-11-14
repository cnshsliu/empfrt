export function post(request) {
	request.locals.perm = null;
	request.locals.user = null;
	return {
		headers: {
			'set-cookie': 'jwt=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
		},
		body: {
			ok: true
		}
	};
}
