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

	const jwtValue = Buffer.from(JSON.stringify(body.user)).toString('base64');

	authStore.set({ jwt: jwtValue });
	let cookieString = `jwt=${jwtValue}; Path=/; HttpOnly`;

	return {
		headers: {
			'set-cookie': cookieString
		},
		body
	};
}
