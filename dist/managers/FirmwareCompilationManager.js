

Object.defineProperty(exports, '__esModule', {
  value: true,
});

const _stringify = require('babel-runtime/core-js/json/stringify');

const _stringify2 = _interopRequireDefault(_stringify);

const _regenerator = require('babel-runtime/regenerator');

const _regenerator2 = _interopRequireDefault(_regenerator);

const _promise = require('babel-runtime/core-js/promise');

const _promise2 = _interopRequireDefault(_promise);

const _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

const _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

const _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

const _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

const _map = require('babel-runtime/core-js/map');

const _map2 = _interopRequireDefault(_map);

const _crypto = require('crypto');

const _crypto2 = _interopRequireDefault(_crypto);

const _fs = require('fs');

const _fs2 = _interopRequireDefault(_fs);

const _path = require('path');

const _path2 = _interopRequireDefault(_path);

const _mkdirp = require('mkdirp');

const _mkdirp2 = _interopRequireDefault(_mkdirp);

const _rmfr = require('rmfr');

const _rmfr2 = _interopRequireDefault(_rmfr);

const _child_process = require('child_process');

const _sparkProtocol = require('spark-protocol');

const _settings = require('../settings');

const _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const IS_COMPILATION_ENABLED = _fs2.default.existsSync(_settings2.default.FIRMWARE_REPOSITORY_DIRECTORY);

const USER_APP_PATH = _path2.default.join(_settings2.default.FIRMWARE_REPOSITORY_DIRECTORY, 'user/applications');
const BIN_PATH = _path2.default.join(_settings2.default.BUILD_DIRECTORY, 'bin');
const MAKE_PATH = _path2.default.join(_settings2.default.FIRMWARE_REPOSITORY_DIRECTORY, 'main');

const FILE_NAME_BY_KEY = new _map2.default();

const getKey = function getKey() {
  return _crypto2.default.randomBytes(24).toString('hex').substring(0, 24);
};

const getUniqueKey = function getUniqueKey() {
  let key = getKey();
  while (FILE_NAME_BY_KEY.has(key)) {
    key = getKey();
  }
  return key;
};

const FirmwareCompilationManager = function FirmwareCompilationManager() {
  (0, _classCallCheck3.default)(this, FirmwareCompilationManager);
};

FirmwareCompilationManager.firmwareDirectoryExists = function () {
  return _fs2.default.existsSync(_settings2.default.FIRMWARE_REPOSITORY_DIRECTORY);
};

FirmwareCompilationManager.getBinaryForID = function (id) {
  if (!FirmwareCompilationManager.firmwareDirectoryExists()) {
    return null;
  }

  const binaryPath = _path2.default.join(BIN_PATH, id);
  if (!_fs2.default.existsSync(binaryPath)) {
    return null;
  }

  const binFileName = _fs2.default.readdirSync(binaryPath).find(file => file.endsWith('.bin'));

  if (!binFileName) {
    return null;
  }

  return _fs2.default.readFileSync(_path2.default.join(binaryPath, binFileName));
};

FirmwareCompilationManager.compileSource = (function () {
  const _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(platformID, files) {
    let platformName,
      appFolder,
      appPath,
      id,
      binPath,
      makeProcess,
      errors,
      sizeInfo,
      date,
      config;
    return _regenerator2.default.wrap((_context) => {
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
            appFolder = (`${platformName}_firmware_${new Date().getTime()}`).toLowerCase();
            appPath = _path2.default.join(USER_APP_PATH, appFolder);

            _mkdirp2.default.sync(appPath);

            files.forEach((file) => {
              const fileName = file.originalname;
              const fileExtension = _path2.default.extname(fileName);
              let iterator = 0;
              let combinedPath = _path2.default.join(appPath, fileName);

              while (_fs2.default.existsSync(combinedPath)) {
                combinedPath = _path2.default.join(appPath, `${_path2.default.basename(fileName, fileExtension)}_${iterator++}${fileExtension}`);
              }

              _fs2.default.writeFileSync(combinedPath, file.buffer);
            });

            id = getUniqueKey();
            binPath = _path2.default.join(BIN_PATH, id);
            makeProcess = (0, _child_process.spawn)('make', [`APP=${appFolder}`, `PLATFORM_ID=${platformID}`, `TARGET_DIR=${_path2.default.relative(MAKE_PATH, binPath).replace(/\\/g, '/')}`], { cwd: MAKE_PATH });
            errors = [];

            makeProcess.stderr.on('data', (data) => {
              console.log(`${data}`);
              errors.push(`${data}`);
            });

            sizeInfo = 'not implemented';

            makeProcess.stdout.on('data', (data) => {
              const output = `${data}`;

              if (output.includes('text\t')) {
                sizeInfo = output;
              }
            });

            _context.next = 19;
            return new _promise2.default((resolve) => {
              makeProcess.on('exit', () => resolve());
            });

          case 19:
            date = new Date();

            date.setDate(date.getDate() + 1);
            config = {
              binary_id: id,
              errors,
              // expire in one day
              expires_at: date,

              // TODO: this variable has a bunch of extra crap including file names.
              // we should filter out the string to only show the file sizes
              sizeInfo,
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
}());

FirmwareCompilationManager.addFirmwareCleanupTask = function (appFolderPath, config) {
  const configPath = _path2.default.join(appFolderPath, 'config.json');
  if (!_fs2.default.existsSync(configPath)) {
    _fs2.default.writeFileSync(configPath, (0, _stringify2.default)(config));
  }
  const currentDate = new Date();
  const difference = new Date(config.expires_at).getTime() - currentDate.getTime();
  setTimeout(() => (0, _rmfr2.default)(appFolderPath), difference);
};

if (IS_COMPILATION_ENABLED) {
  // Delete all expired binaries or queue them up to eventually be deleted.
  if (!_fs2.default.existsSync(_settings2.default.BUILD_DIRECTORY)) {
    _mkdirp2.default.sync(_settings2.default.BUILD_DIRECTORY);
  }
  if (!_fs2.default.existsSync(BIN_PATH)) {
    _mkdirp2.default.sync(BIN_PATH);
  }

  _fs2.default.readdirSync(USER_APP_PATH).forEach((file) => {
    const appFolder = _path2.default.join(USER_APP_PATH, file);
    const configPath = _path2.default.join(appFolder, 'config.json');
    if (!_fs2.default.existsSync(configPath)) {
      return;
    }

    const configString = _fs2.default.readFileSync(configPath, 'utf8');
    if (!configString) {
      return;
    }
    const config = JSON.parse(configString);
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
