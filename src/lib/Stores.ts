import { writable } from 'svelte/store';
export const printing = writable(false);
export const notifyMessage = writable('');
