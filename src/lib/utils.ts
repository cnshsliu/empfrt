export async function post(endpoint: string, data = {}): Promise<Response> {
	return fetch(endpoint, {
		method: 'POST',
		credentials: 'include',
		body: JSON.stringify(data || {}),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then((r) => r.json());
}
export const isBlank = function (val: string) {
	if (val === undefined || val === null || val === '') return true;
	else return false;
};
export const blankToDefault = function (val: string, defaultValue: string) {
	if (isBlank(val)) return defaultValue;
	else return val;
};
export const hasValue = function (val: string) {
	return !isBlank(val);
};

/**
 * 全角转半角
 */
export const qtb = function (str: string) {
	str = str.replace(/；/g, ';');
	str = str.replace(/：/g, ':');
	str = str.replace(/，/g, ',');
	str = str.replace(/（/g, '(');
	str = str.replace(/）/g, ')');
	str = str.replace(/｜/g, '|');
	return str;
};
