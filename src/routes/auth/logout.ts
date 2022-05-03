import { filterStorage } from '$lib/empstores';
export function post({ params, request }) {
	filterStorage.set({});
	return {
		headers: {
			'Set-Cookie': [
				'jwt=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
				//'token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
			]
		},
		body: {
			ok: true
		}
	};
}
