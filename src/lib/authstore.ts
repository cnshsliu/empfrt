import storage from '$lib/storage';

interface Auth {
	jwt: string;
}

export const authStore = storage<Auth>('auth', { jwt: '' });
