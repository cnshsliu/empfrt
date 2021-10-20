const ErrorProcessor = {
	setError: function (errors, delimiter) {
		let ret = '';
		if (errors) {
			for (const [key, msgs] of Object.entries(errors)) {
				let msgChanged = false;
				for (let i = 0; i < msgs.length; i++) {
					if (msgs[i].indexOf('duplicate key') > -1) {
						msgs[i] = '重复对象已存在';
					}
					if (ret === '') ret = msgs[i];
					else ret = ret + delimiter + msgs[i];
				}
			}
		}
		console.log('ret ', ret);
		console.log(ret);
		return ret;
	}
};

export default ErrorProcessor;
