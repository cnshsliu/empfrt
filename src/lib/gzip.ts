'use strict';

import zlib from 'zlib';

export const zipit = function (input, options?: any) {
	const promise = new Promise(function (resolve, reject) {
		zlib.gzip(input, options, function (error, result) {
			if (!error) resolve(result);
			else reject(Error(error.message));
		});
	});
	return promise;
};

export const unzipit = function (input, options?: any) {
	const promise = new Promise(function (resolve, reject) {
		zlib.gunzip(input, options, function (error, result) {
			if (!error) resolve(result);
			else reject(Error(error.message));
		});
	});
	return promise;
};

export default { zipit, unzipit };
