import cookie from 'cookie';
import { v4 as uuid } from '@lukeed/uuid';
import type { Handle } from '@sveltejs/kit';
import {authStore} from '$lib/authstore';
import { writable, get } from 'svelte/store'

export const handle: Handle = async ({ request, resolve }) => {
	const cookies = cookie.parse(request.headers.cookie || '');

	// TODO https://github.com/sveltejs/kit/issues/1046
	if (request.query.has('_method')) {
		request.method = request.query.get('_method').toUpperCase();
	}

	let auth = get(authStore);
	//console.log("Got authStore:", auth);

	const jwt = auth && Buffer.from(auth.jwt, 'base64').toString('utf-8');
	request.locals.user = jwt ? JSON.parse(jwt) : null;
	//console.log("Hook handle set request.locals.user to:", request.locals.user);

	const response = await resolve(request);

	return response;
};

export function getSession({ locals }) {
	return {
		user: locals.user && {
			username: locals.user.username,
			email: locals.user.email,
			avatar: locals.user.avatar,
			bio: locals.user.bio,
			sessionToken: locals.user.sessionToken,
		},
		config: {
			sort:{field:'createdAt', order:-1}
		}
	};
}
