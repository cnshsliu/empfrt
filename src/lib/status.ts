export const Status = {
	ST_RUN: 'Running',
	ST_DONE: 'Finished',
	ST_REVOKED: 'Revoked',
	ST_RETURNED: 'Returned',
	ST_PAUSE: 'Paused',
	ST_STOP: 'STOPPED',
	ST_IGNORE: 'Ignored'
};

export const StatusIcon = {
	ST_RUN: 'bi-activity',
	ST_DONE: 'Finished',
	ST_REVOKED: 'bi-box-arrow-left',
	ST_RETURNED: 'bi-replay',
	ST_PAUSE: 'bi-pause',
	ST_STOP: 'bi-stop',
	ST_IGNORE: 'bi-slash'
};
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
			ret = border ? 'text-primary border border-info' : 'text-primary';
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
