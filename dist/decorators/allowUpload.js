

Object.defineProperty(exports, '__esModule', {
  value: true,
});

/* eslint-disable no-param-reassign */
exports.default = function () {
  const fileName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
  const maxCount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return function (target, name, descriptor) {
    const allowedUploads = target[name].allowedUploads || [];
    if (fileName) {
      allowedUploads.push({
        maxCount,
        name: fileName,
      });
    }

    target[name].allowedUploads = allowedUploads;
    return descriptor;
  };
};
