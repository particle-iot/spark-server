'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/* eslint-disable no-param-reassign */
exports.default = function (httpVerb) {
  return function (target, name, descriptor) {
    target[name].httpVerb = httpVerb;
    return descriptor;
  };
};