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
export function StatusClass(status: string): string {
	let ret = status;
	switch (status) {
		case 'ST_RUN':
			ret = 'text-primary';
			break;
		case 'ST_DONE':
			ret = 'text-success';
			break;
		case 'ST_REVOKED':
			ret = 'text-warning';
			break;
		case 'ST_RETURNED':
			ret = 'text-warning';
			break;
		case 'ST_PAUSE':
			ret = 'text-secondary';
			break;
		case 'ST_STOP':
			ret = 'text-danger';
			break;
		case 'ST_IGNORE':
			ret = 'text-info';
			break;
	}
	return ret;
}
