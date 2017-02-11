

Object.defineProperty(exports, '__esModule', {
  value: true,
});

/* eslint-disable no-param-reassign */
exports.default = function () {
  return function (target, name, descriptor) {
    target[name].anonymous = true;
    return descriptor;
  };
};
