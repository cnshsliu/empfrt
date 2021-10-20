import storage from '$lib/store';

interface Auth {
	jwt: string;
}

export const authStore = storage<Auth>('auth', { jwt: '' });
