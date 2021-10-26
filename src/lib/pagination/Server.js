import * as api from '$lib/api';

export async function getData(endpoint, token, page, pageSize, text, sorting, payload_extra) {
	let skip = page * pageSize;
	let limit = pageSize;
	let payload = { pattern: text, skip: skip, limit: limit };
	if (sorting && sorting.dir === 'desc') {
		payload.sort_order = -1;
	} else {
		payload.sort_order = 1;
	}
	if (sorting && sorting.key) {
		payload.sort_field = sorting.key;
	}
	payload = { ...payload, ...payload_extra };
	const ret = await api.post(endpoint, payload, token);

	//服务端需要返回对象{objs:[], total: number}
	return { rows: ret.objs, rowsCount: ret.total };
}
