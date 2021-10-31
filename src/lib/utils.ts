export async function post(endpoint: string, data = {}): Promise<Response> {
	console.log(endpoint);
	console.log(data);
	return fetch(endpoint, {
		method: 'POST',
		credentials: 'include',
		body: JSON.stringify(data || {}),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then((r) => r.json());
}
