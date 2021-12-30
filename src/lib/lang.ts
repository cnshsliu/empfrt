export function StatusLabel(status: string): string {
	let ret = status;
	switch (status) {
		case 'ST_RUN':
			ret = 'Running';
			break;
		case 'ST_DONE':
			ret = 'Finished';
			break;
		case 'ST_REVOKED':
			ret = 'Revoked';
			break;
		case 'ST_RETURNED':
			ret = 'Returned';
			break;
		case 'ST_PAUSE':
			ret = 'Paused';
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
export function StatusClass(status: string, border = false): string {
	let ret = status;
	switch (status) {
		case 'ST_RUN':
			ret = border ? 'text-info border border-info' : 'text-info';
			break;
		case 'ST_DONE':
			ret = border ? 'text-success border border-success' : 'text-success';
			break;
		case 'ST_REVOKED':
			ret = border ? 'text-warning border border-warining' : 'text-warning';
			break;
		case 'ST_RETURNED':
			ret = border ? 'text-warning border border-warining' : 'text-warning';
			break;
		case 'ST_PAUSE':
			ret = border ? 'text-secondary border border-secondary' : 'text-secondary';
			break;
		case 'ST_STOP':
			ret = border ? 'text-danger border border-danger' : 'text-danger';
			break;
		case 'ST_IGNORE':
			ret = border ? 'text-black-50 border border-black-50' : 'text-black-50';
			break;
	}
	return ret;
}
