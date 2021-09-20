const base = 'http://localhost:5008';

type OPTS = {
	method: string;
	headers: any;
	body?: string;
};
async function send({ method, path, data, token }) {
	const opts: OPTS = { method, headers: {} };

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}

	if (token) {
		console.log('api send with token', token);
		opts.headers['Authorization'] = token;
	}


	return fetch(`${base}/${path}`, opts)
		.then((r) => r.text())
		.then((json) => {
			try {
				return JSON.parse(json);
			} catch (err) {
				return json;
			}
		});
}

export function get(path:string, token:string):Promise<string> {
	return send({ method: 'GET', path, data:null, token });
}

export function del(path:string, token:string):Promise<string> {
	return send({ method: 'DELETE', path, data:null, token });
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function post(path:string, data:any, token:string):Promise<string> {
	return send({ method: 'POST', path, data, token });
}

export function put(path:string, data:JSON, token:string):Promise<string> {
	return send({ method: 'PUT', path, data, token });
}
