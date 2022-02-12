import { API_SERVER } from '$lib/Env';
import ErrorProcessor from '$lib/errorProcessor';

type OPTS = {
	method: string;
	headers: unknown;
	body?: string;
};
export async function sendSimple({ method, path, data = null, token = null }) {
	const opts: OPTS = { method, headers: {} };

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}
	//console.debug(path, opts.body);

	if (token) {
		opts.headers['Authorization'] = token;
	}

	return await fetch(`${API_SERVER}/${path}`, opts as RequestInit);
}
async function send({ method, path, data = null, token = null }) {
	const opts: OPTS = { method, headers: {} };

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}
	//console.debug(path, opts.body);

	if (token) {
		opts.headers['Authorization'] = token;
	}

	let fullPath = path.startsWith('/') ? `${API_SERVER}${path}` : `${API_SERVER}/${path}`;
	return fetch(fullPath, opts as RequestInit)
		.then((r) => r.text())
		.then((json) => {
			try {
				let ret = JSON.parse(json);
				if (ret.error) {
					ret = ErrorProcessor.normalizeError(ret);
				}
				return ret;
			} catch (err) {
				let ret = json;
				return ret;
			}
		});
}

export function get(path: string, token: string): Promise<unknown> {
	return send({ method: 'GET', path, data: null, token });
}

export function del(path: string, token: string): Promise<unknown> {
	return send({ method: 'DELETE', path, data: null, token });
}

export function post(
	path: string,
	data: any = null,
	token: string = null
): Promise<Record<string, any>> {
	return send({ method: 'POST', path, data, token });
}

export function put(path: string, data: JSON, token: string): Promise<unknown> {
	return send({ method: 'PUT', path, data, token });
}
