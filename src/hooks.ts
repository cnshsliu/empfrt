import cookie from 'cookie';
import Parser from '$lib/parser';

export async function handle({ request, resolve }) {
	/*
	const cookies = cookie.parse(request.headers.cookie || '');
	request.locals.user = cookies.user;

	const response = await resolve(request);
	response.headers['set-cookie'] = `user=${request.locals.user || ''}; Path=/; HttpOnly`;
	console.log('SetCookie:', request.locals.user);

	return response;
	*/
	const cookies = cookie.parse(request.headers.cookie || '');
	const jwt = cookies.jwt && Buffer.from(cookies.jwt, 'base64').toString('utf-8');
	request.locals.user = jwt ? JSON.parse(jwt) : null;
	return await resolve(request);
}

export function getSession({ locals }) {
	let ret = {
		user: locals.user
	};
	return ret;
}

/*
 * manifest
export async function getSession(request) {
	let userValue = '';
	if (request.locals.user) {
		userValue = JSON.parse(Parser.base64ToCode(request.locals.user));
	}
	console.log('Session.user=', userValue);

	return {
		user: userValue
	};
}
 */
