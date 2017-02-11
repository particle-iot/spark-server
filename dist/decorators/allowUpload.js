'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/* eslint-disable no-param-reassign */
exports.default = function () {
  var fileName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
  var maxCount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return function (target, name, descriptor) {
    var allowedUploads = target[name].allowedUploads || [];
    if (fileName) {
      allowedUploads.push({
        maxCount: maxCount,
        name: fileName
      });
    }

    target[name].allowedUploads = allowedUploads;
    return descriptor;
  };
};