import { writable } from 'svelte/store';
import type { User } from '$lib/types';

export const user = writable < User > {};

if (process.browser) {
	user = writable<User>(JSON.parse(localStorage.getItem('user')));
	user.subscribe((value) => (localStorage.user = JSON.stringify(value)));
}
