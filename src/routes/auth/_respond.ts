import storage from '$lib/storage';
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
	const daysToExpire = new Date(2147483647 * 1000).toUTCString();
	let cookieString = `jwt=${jwtValue}; expires=${daysToExpire}; Path=/; HttpOnly`;

	return {
		headers: {
			'set-cookie': cookieString
		},
		body
	};
}
