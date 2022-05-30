/* eslint-disable @typescript-eslint/no-explicit-any */
import { _ } from '$lib/i18n';
const ErrorProcessor = {
	setError: function (errors, delimiter) {
		let ret = '';
		if (errors) {
			for (const [key, msgs] of Object.entries(errors)) {
				let msgChanged = false;
				for (let i = 0; i < msgs.length; i++) {
					if (msgs[i].indexOf('duplicate key') > -1) {
						msgs[i] = 'Duplicated objects';
					}
					if (ret === '') ret = msgs[i];
					else ret = ret + delimiter + msgs[i];
				}
			}
		}
		return ret;
	},
};

export default ErrorProcessor;
