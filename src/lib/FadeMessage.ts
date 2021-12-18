import type { oneArgFunc } from '$lib/types';
import { getNotificationsContext } from 'svelte-notifications';
const { addNotification } = getNotificationsContext();
export function setFadeMessage(
	message: string,
	type = 'warning',
	pos = 'bottom-right',
	time = 2000
) {
	(addNotification as oneArgFunc)({
		text: message,
		position: pos,
		type: type,
		removeAfter: time
	});
}
