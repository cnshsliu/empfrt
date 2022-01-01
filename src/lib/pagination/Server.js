import * as api from '$lib/api';

export async function getData(
	endpoint,
	token,
	page,
	pageSize,
	searchFilter,
	sorting,
	payload_extra
) {
	let skip = page * pageSize;
	let limit = pageSize;
	let payload = { pattern: searchFilter, skip: skip, limit: limit };
	if (sorting && sorting.dir === 'desc') {
		payload.sort_order = -1;
	} else {
		payload.sort_order = 1;
	}
	if (sorting && sorting.key) {
		payload.sort_field = sorting.key;
	}
	payload = { ...payload, ...payload_extra };
	console.log('Server.post', endpoint, JSON.stringify(payload, null, 2));
	const ret = await api.post(endpoint, payload, token);

	//服务端需要返回对象{objs:[], total: number}
	return { rows: ret.objs, rowsCount: ret.total };
}
