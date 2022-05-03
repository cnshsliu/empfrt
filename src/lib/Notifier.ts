import { notifyMessage } from '$lib/Stores';

export function setFadeMessage(
	message: string,
	type = 'success',
	pos = 'bottom-right',
	time = 3000
) {
	notifyMessage.set({ message, type, pos, time });
}
