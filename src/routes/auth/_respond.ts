import storage from '$lib/store';
import { authStore } from '$lib/authstore';
import { writable, get } from 'svelte/store';

interface Auth {
	jwt: string;
}

export function respond(body) {
	if (body.error) {
		return { status: 401, body };
	}

	const json = JSON.stringify(body.user);
	const value = Buffer.from(json).toString('base64');
	console.log('.......JWT', value);

	authStore.set({ jwt: value });

	return {
		headers: {
			'set-cookie': `jwt=${value}; Path=/; HttpOnly`
		},
		body
	};
}
