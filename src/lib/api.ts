import { API_SERVER } from '$lib/Env';
import ErrorProcessor from '$lib/errorProcessor';
import { fetchCache } from '$lib/Stores';
import MD5 from 'blueimp-md5';

let theCache = {};

const unsubscribe = fetchCache.subscribe((value) => {
	theCache = value;
});

type OPTS = {
	method: string;
	headers: unknown;
	mode?: string;
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
		opts.headers['authorization'] = token;
	}

	return await fetch(`${API_SERVER}/${path}`, opts as RequestInit);
}

async function send({ method, path, data = null, token = null }): Promise<any> {
	const opts: OPTS = { method, headers: {} };
	const cacheKey = { method: method, path: path, body: {}, token: '' };

	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
		cacheKey.body = opts.body;
	}
	//console.debug(path, opts.body);

	if (token) {
		//HAPI.dev中的extract.js会从从多处取tokens
		// 如下
		//  const cookieKey = customOrDefaultKey(options, 'cookieKey', 'token');
		//const headerKey = customOrDefaultKey(options, 'headerKey', 'authorization');
		//const urlKey = customOrDefaultKey(options, 'urlKey', 'token');
		//const payloadKey = customOrDefaultKey(options, 'payloadKey', 'token');
		//const pattern = new RegExp(options.tokenType + '\\s+([^$]+)', 'i');
		opts.headers['authorization'] = token;
		cacheKey.token = token;
	}

	let returnCode304 = false;
	let foundCache = false;
	const cacheID = MD5(JSON.stringify(cacheKey));
	if (theCache[cacheID]) {
		foundCache = true;
		//console.log(path, 'Found cacheID in cache, should add If-None-Match header');
		opts.headers['If-None-Match'] = theCache[cacheID].etag;
		// } else {
		//   console.log(path, 'no local cache');
	}

	let fullPath = path.startsWith('/') ? `${API_SERVER}${path}` : `${API_SERVER}/${path}`;
	let responseETag = '';
	return fetch(fullPath, opts as RequestInit)
		.then((response) => {
			if (response.status === 304) {
				//console.log(path, 'Got 304');
				returnCode304 = true;
				responseETag = response.headers.get('etag');
				return theCache[cacheID].data;
			} else {
				responseETag = response.headers.get('etag');
				return response.text();
			}
		})
		.then((jsonText) => {
			//console.log(path, 'Response etag', responseETag);
			try {
				let ret = JSON.parse(jsonText);
				if (ret.error) {
					ret = ErrorProcessor.normalizeError(ret);
					delete theCache[cacheID];
					console.log(path, 'Clear cache key on error', cacheID);
				} else {
					if (!(foundCache && returnCode304)) {
						if (responseETag) {
							theCache[cacheID] = {
								path: path,
								data: jsonText,
								etag: responseETag ? responseETag : '',
							};
							//console.log(path, 'Update cache to', theCache);
							console.log(path, 'Update cache ');
							fetchCache.set(theCache);
							// } else {
							//   console.log(path, 'Not cachable, no etag');
						}
					} else {
						console.log(path, 'HIT fetch cache on 304, etag', responseETag);
					}
				}
				return ret;
			} catch (err) {
				let ret = jsonText;
				return ret;
			}
		});
}

export function get(path: string, token: string): Promise<any> {
	return send({ method: 'GET', path, data: null, token });
}

export function del(path: string, token: string): Promise<any> {
	return send({ method: 'DELETE', path, data: null, token });
}

export function post(path: string, data: any = null, token: string = null): Promise<any> {
	return send({ method: 'POST', path, data, token });
}

export function getCache(path: string, data: {}, token: string): Promise<any> {
	const cacheKey = { method: 'POST', path: path, body: JSON.stringify(data), token: token };
	const cacheID = MD5(JSON.stringify(cacheKey));
	if (theCache[cacheID]) {
		return JSON.parse(theCache[cacheID].data);
	} else {
		return null;
	}
}

export function removeCacheByPath(path: string) {
	for (const key in theCache) {
		let value = theCache[key];
		if (value.path === path) {
			delete theCache[key];
		}
	}
	return null;
}

export function put(path: string, data: JSON, token: string): Promise<any> {
	return send({ method: 'PUT', path, data, token });
}
