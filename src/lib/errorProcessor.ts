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
		return ret;
	},

	normalizeError: function (ret) {
		if (ret.error) {
			if (ret.statusCode === 400) {
				switch (ret.error) {
					case 'Bad Request':
						if (ret.message.match(/"password".*fails to match/)) {
							ret.message = '密码长度必须在6-12之间，包含大小写字母数字及特殊字符';
						} else if (ret.message.match(/"username".*fails to match/)) {
							ret.message = '用户名长度必须在4-12之间，且只包含大小写字母和数字';
						}
						break;
					case 'duplicate_email':
						ret.message = 'email已存在';
						break;
					case 'duplicate_wfid':
						ret.message = 'wfid已存在';
						break;
					case 'login_no_user':
						break;
					case 'login_failed':
						ret.message = '登录失败，请检查';
						break;
				}
			}
		}
		return ret;
	}
};

export default ErrorProcessor;
