

Object.defineProperty(exports, '__esModule', {
  value: true,
});

/* eslint-disable no-param-reassign */
exports.default = function (route) {
  return function (target, name, descriptor) {
    target[name].route = route;
    return descriptor;
  };
};
