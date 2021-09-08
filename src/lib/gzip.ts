'use strict';

import zlib from 'zlib';

export const gzip = function (input, options)  {
    const promise = new Promise(function(resolve, reject) {
      zlib.gzip(input, options, function (error, result) {
        if(!error) resolve(result);
        else reject(Error(error));
      });
    });
    return promise;
  };

export const gunzip = function (input, options) {
    const promise = new Promise(function(resolve, reject) {
      zlib.gunzip(input, options, function (error, result) {
        if(!error) resolve(result);
        else reject(Error(error));
      });
    });
    return promise;
  };
