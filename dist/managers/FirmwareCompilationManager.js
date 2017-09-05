'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _rmfr = require('rmfr');

var _rmfr2 = _interopRequireDefault(_rmfr);

var _child_process = require('child_process');

var _sparkProtocol = require('spark-protocol');

var _settings = require('../settings');

var _settings2 = _interopRequireDefault(_settings);

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = _logger2.default.createModuleLogger(module);

var IS_COMPILATION_ENABLED = _fs2.default.existsSync(_settings2.default.FIRMWARE_REPOSITORY_DIRECTORY);

var USER_APP_PATH = _path2.default.join(_settings2.default.FIRMWARE_REPOSITORY_DIRECTORY, 'user/applications');
var BIN_PATH = _path2.default.join(_settings2.default.BUILD_DIRECTORY, 'bin');
var MAKE_PATH = _path2.default.join(_settings2.default.FIRMWARE_REPOSITORY_DIRECTORY, 'main');

var FILE_NAME_BY_KEY = new _map2.default();

var getKey = function getKey() {
  return _crypto2.default.randomBytes(24).toString('hex').substring(0, 24);
};

var getUniqueKey = function getUniqueKey() {
  var key = getKey();
  while (FILE_NAME_BY_KEY.has(key)) {
    key = getKey();
  }
  return key;
};

var FirmwareCompilationManager = function FirmwareCompilationManager() {
  (0, _classCallCheck3.default)(this, FirmwareCompilationManager);
};

FirmwareCompilationManager.firmwareDirectoryExists = function () {
  return _fs2.default.existsSync(_settings2.default.FIRMWARE_REPOSITORY_DIRECTORY);
};

FirmwareCompilationManager.getBinaryForID = function (id) {
  if (!FirmwareCompilationManager.firmwareDirectoryExists()) {
    return null;
  }

  var binaryPath = _path2.default.join(BIN_PATH, id);
  if (!_fs2.default.existsSync(binaryPath)) {
    return null;
  }

  var binFileName = _fs2.default.readdirSync(binaryPath).find(function (file) {
    return file.endsWith('.bin');
  });

  if (!binFileName) {
    return null;
  }

  return _fs2.default.readFileSync(_path2.default.join(binaryPath, binFileName));
};

FirmwareCompilationManager.compileSource = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(platformID, files) {
    var platformName, appFolder, appPath, id, binPath, makeProcess, errors, sizeInfo, date, config;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (FirmwareCompilationManager.firmwareDirectoryExists()) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return', null);

          case 2:
            platformName = _sparkProtocol.knownPlatforms[platformID];

            if (platformName) {
              _context.next = 5;
              break;
            }

            return _context.abrupt('return', null);

          case 5:

            platformName = platformName.toLowerCase();
            appFolder = (platformName + '_firmware_' + new Date().getTime()).toLowerCase();
            appPath = _path2.default.join(USER_APP_PATH, appFolder);

            _mkdirp2.default.sync(appPath);

            files.forEach(function (file) {
              var fileName = file.originalname;
              var fileExtension = _path2.default.extname(fileName);
              var iterator = 0;
              var combinedPath = _path2.default.join(appPath, fileName);

              while (_fs2.default.existsSync(combinedPath)) {
                combinedPath = _path2.default.join(appPath, '' + _path2.default.basename(fileName, fileExtension) + ('_' + iterator++ + fileExtension) // eslint-disable-line no-plusplus
                );
              }

              _fs2.default.writeFileSync(combinedPath, file.buffer);
            });

            id = getUniqueKey();
            binPath = _path2.default.join(BIN_PATH, id);
            makeProcess = (0, _child_process.spawn)('make', ['APP=' + appFolder, 'PLATFORM_ID=' + platformID, 'TARGET_DIR=' + _path2.default.relative(MAKE_PATH, binPath).replace(/\\/g, '/')], { cwd: MAKE_PATH });
            errors = [];

            makeProcess.stderr.on('data', function (data) {
              logger.error({ data: data }, 'Error from MakeProcess');
              errors.push('' + data);
            });

            sizeInfo = 'not implemented';

            makeProcess.stdout.on('data', function (data) {
              var output = '' + data;

              if (output.includes('text\t')) {
                sizeInfo = output;
              }
            });

            _context.next = 19;
            return new _promise2.default(function (resolve) {
              makeProcess.on('exit', function () {
                return resolve();
              });
            });

          case 19:
            date = new Date();

            date.setDate(date.getDate() + 1);
            config = {
              binary_id: id,
              errors: errors,
              // expire in one day
              expires_at: date,

              // TODO: this variable has a bunch of extra crap including file names.
              // we should filter out the string to only show the file sizes
              sizeInfo: sizeInfo
            };


            FirmwareCompilationManager.addFirmwareCleanupTask(appPath, config);

            return _context.abrupt('return', config);

          case 24:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

FirmwareCompilationManager.addFirmwareCleanupTask = function (appFolderPath, config) {
  var configPath = _path2.default.join(appFolderPath, 'config.json');
  if (!_fs2.default.existsSync(configPath)) {
    _fs2.default.writeFileSync(configPath, (0, _stringify2.default)(config));
  }
  var currentDate = new Date();
  var difference = new Date(config.expires_at).getTime() - currentDate.getTime();
  setTimeout(function () {
    return (0, _rmfr2.default)(appFolderPath);
  }, difference);
};

if (IS_COMPILATION_ENABLED) {
  // Delete all expired binaries or queue them up to eventually be deleted.
  if (!_fs2.default.existsSync(_settings2.default.BUILD_DIRECTORY)) {
    _mkdirp2.default.sync(_settings2.default.BUILD_DIRECTORY);
  }
  if (!_fs2.default.existsSync(BIN_PATH)) {
    _mkdirp2.default.sync(BIN_PATH);
  }

  _fs2.default.readdirSync(USER_APP_PATH).forEach(function (file) {
    var appFolder = _path2.default.join(USER_APP_PATH, file);
    var configPath = _path2.default.join(appFolder, 'config.json');
    if (!_fs2.default.existsSync(configPath)) {
      return;
    }

    var configString = _fs2.default.readFileSync(configPath, 'utf8');
    if (!configString) {
      return;
    }
    var config = JSON.parse(configString);
    if (config.expires_at < new Date()) {
      // TODO - clean up artifacts in the firmware folder. Every binary will have
      // files in firmare/build/target/user & firmware/build/target/user-part
      // It might make the most sense to just create a custom MAKE file to do this
      (0, _rmfr2.default)(configPath);
      (0, _rmfr2.default)(_path2.default.join(BIN_PATH, config.binary_id));
    } else {
      FirmwareCompilationManager.addFirmwareCleanupTask(appFolder, config);
    }
  });
}

exports.default = FirmwareCompilationManager;