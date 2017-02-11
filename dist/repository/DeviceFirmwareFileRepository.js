'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _dec, _desc, _value, _class;

var _sparkProtocol = require('spark-protocol');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var DeviceFirmwareFileRepository = (_dec = (0, _sparkProtocol.memoizeGet)([], { promise: false }), (_class = function () {
  function DeviceFirmwareFileRepository(path) {
    (0, _classCallCheck3.default)(this, DeviceFirmwareFileRepository);

    this._fileManager = new _sparkProtocol.FileManager(path, false);
  }

  (0, _createClass3.default)(DeviceFirmwareFileRepository, [{
    key: 'getByName',
    value: function getByName(appName) {
      return this._fileManager.getFileBuffer(appName + '.bin');
    }
  }]);
  return DeviceFirmwareFileRepository;
}(), (_applyDecoratedDescriptor(_class.prototype, 'getByName', [_dec], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getByName'), _class.prototype)), _class));
exports.default = DeviceFirmwareFileRepository;