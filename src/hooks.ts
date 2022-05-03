import cookie from 'cookie';

export async function handle({ event, resolve }) {
	if (event && event.request) {
		let cookieString = event.request.headers.get('cookie');
		const cookies = cookie.parse(cookieString || '');
		const jwt = cookies.jwt && Buffer.from(cookies.jwt, 'base64').toString('utf-8');
		event.locals.user = jwt ? JSON.parse(jwt) : null;
	}
	const response = await resolve(event, {
		//ssr: true
		ssr: !event.url.pathname.startsWith('/admin')
	});
	return response;
}

export function getSession(event: any) {
	return event.locals.user
		? {
				user: event.locals.user
		  }
		: { user: null };
}
