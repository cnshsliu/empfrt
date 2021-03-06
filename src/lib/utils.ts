export async function post(endpoint: string, data = {}): Promise<Response> {
	return fetch(endpoint, {
		method: 'POST',
		credentials: 'include',
		body: JSON.stringify(data || {}),
		headers: {
			'Content-Type': 'application/json',
		},
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
export const nbArray = function (arr) {
	return arr && Array.isArray(arr) && arr.length > 0;
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
	str = str.replace(/“/g, '"');
	str = str.replace(/”/g, '"');
	str = str.replace(/。/g, '.');
	str = str.replace(/【/g, '[');
	str = str.replace(/】/g, ']');
	str = str.replace(/「/g, '{');
	str = str.replace(/」/g, '}');
	str = str.replace(/？/g, '?');
	str = str.replace(/《/g, '<');
	str = str.replace(/》/g, '>');
	return str;
};

export const formatId = function (id) {
	if (id.match('^[A-Za-z][\\w]*$')) {
		return '';
	} else {
		return 'wrong format';
	}
};

export const objectEqual = (obj1, obj2) => {
	return Object.entries(obj1).toString() === Object.entries(obj2).toString();
};
