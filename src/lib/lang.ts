export function StatusLabel(status: string): string {
	let ret = status;
	switch (status) {
		case 'ST_RUN':
			ret = 'Running';
			break;
		case 'ST_DONE':
			ret = 'Finished';
			break;
		case 'ST_PAUSE':
			ret = 'Paused';
			break;
		case 'ST_RETURNED':
			ret = 'Returned';
			break;
		case 'ST_STOP':
			ret = 'Stopped';
			break;
		case 'ST_IGNORE':
			ret = 'Ignored';
			break;
	}
	return ret;
}
