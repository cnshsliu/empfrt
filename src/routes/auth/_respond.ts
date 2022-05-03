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

	return {
		headers: {
			'Set-Cookie': [
				`jwt=${jwtValue};  expires=${daysToExpire}; Path=/; HttpOnly`
				//`token=${body.user.sessionToken}; expires=${daysToExpire}; Path=/; HttpOnly`
				//上面一行本来想测试hapi.dev的authentication过程从cookie中取Token，
				//但取用户avatar是从emp.MTC_server取得，不是 mtc.MTC_Server
				//因此，现直接在 avatar 后面添加 token=sessionToken
				//后续可以 尝试
				//1. 是否可以用MTCsever url 来取avatar，再通过caddy来转发请求到EMP server
			]
		},
		body
	};
}
