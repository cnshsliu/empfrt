import { API_SERVER } from '$lib/Env';
import ErrorProcessor from '$lib/errorProcessor';

type OPTS = {
	method: string;
	headers: unknown;
	body?: string;
};
async function send({ method, path, data, token }) {
	const opts: OPTS = { method, headers: {} };

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}

	if (token) {
		opts.headers['Authorization'] = token;
	}

	return fetch(`${API_SERVER}/${path}`, opts as RequestInit)
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

export function post(path: string, data: any, token: string): Promise<unknown> {
	return send({ method: 'POST', path, data, token });
}

export function put(path: string, data: JSON, token: string): Promise<unknown> {
	return send({ method: 'PUT', path, data, token });
}
