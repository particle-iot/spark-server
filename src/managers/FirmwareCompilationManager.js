// @flow

import type { File } from 'express';

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import rmfr from 'rmfr';
import { spawn } from 'child_process';
import { knownPlatforms } from 'spark-protocol';
import settings from '../settings';
import Logger from '../lib/logger';
const logger = Logger.createModuleLogger(module);

const IS_COMPILATION_ENABLED = fs.existsSync(
  settings.FIRMWARE_REPOSITORY_DIRECTORY,
);

const USER_APP_PATH = path.join(
  settings.FIRMWARE_REPOSITORY_DIRECTORY,
  'user/applications',
);
const BIN_PATH = path.join(settings.BUILD_DIRECTORY, 'bin');
const MAKE_PATH = path.join(settings.FIRMWARE_REPOSITORY_DIRECTORY, 'main');

type CompilationResponse = {
  binary_id: string,
  expires_at: Date,
  errors?: Array<string>,
  sizeInfo: string,
};

const FILE_NAME_BY_KEY = new Map();

const getKey = (): string =>
  crypto.randomBytes(24).toString('hex').substring(0, 24);

const getUniqueKey = (): string => {
  let key = getKey();
  while (FILE_NAME_BY_KEY.has(key)) {
    key = getKey();
  }
  return key;
};

class FirmwareCompilationManager {
  static firmwareDirectoryExists = (): boolean =>
    fs.existsSync(settings.FIRMWARE_REPOSITORY_DIRECTORY);

  static getBinaryForID = (id: string): ?Buffer => {
    if (!FirmwareCompilationManager.firmwareDirectoryExists()) {
      return null;
    }

    const binaryPath = path.join(BIN_PATH, id);
    if (!fs.existsSync(binaryPath)) {
      return null;
    }

    const binFileName = fs
      .readdirSync(binaryPath)
      .find((file: string): boolean => file.endsWith('.bin'));

    if (!binFileName) {
      return null;
    }

    return fs.readFileSync(path.join(binaryPath, binFileName));
  };

  static compileSource = async (
    platformID: string,
    files: Array<File>,
  ): Promise<?CompilationResponse> => {
    if (!FirmwareCompilationManager.firmwareDirectoryExists()) {
      return null;
    }

    let platformName = knownPlatforms[platformID];
    if (!platformName) {
      return null;
    }

    platformName = platformName.toLowerCase();
    const appFolder = `${platformName}_firmware_${new Date().getTime()}`.toLowerCase();
    const appPath = path.join(USER_APP_PATH, appFolder);
    mkdirp.sync(appPath);

    files.forEach((file: File) => {
      const fileName = file.originalname;
      const fileExtension = path.extname(fileName);
      let iterator = 0;
      let combinedPath = path.join(appPath, fileName);

      while (fs.existsSync(combinedPath)) {
        combinedPath = path.join(
          appPath,
          `${path.basename(fileName, fileExtension)}` +
            `_${iterator++}${fileExtension}`, // eslint-disable-line no-plusplus
        );
      }

      fs.writeFileSync(combinedPath, file.buffer);
    });

    const id = getUniqueKey();
    const binPath = path.join(BIN_PATH, id);
    const makeProcess = spawn(
      'make',
      [
        `APP=${appFolder}`,
        `PLATFORM_ID=${platformID}`,
        `TARGET_DIR=${path.relative(MAKE_PATH, binPath).replace(/\\/g, '/')}`,
      ],
      { cwd: MAKE_PATH },
    );

    const errors = [];
    makeProcess.stderr.on('data', (data: string) => {
      logger.error({ data }, 'Error from MakeProcess');
      errors.push(`${data}`);
    });

    let sizeInfo = 'not implemented';
    makeProcess.stdout.on('data', (data: string) => {
      const output = `${data}`;

      if (output.includes('text\t')) {
        sizeInfo = output;
      }
    });

    await new Promise((resolve: () => void) => {
      makeProcess.on('exit', (): void => resolve());
    });

    const date = new Date();
    date.setDate(date.getDate() + 1);
    const config = {
      binary_id: id,
      errors,
      // expire in one day
      expires_at: date,

      // TODO: this variable has a bunch of extra crap including file names.
      // we should filter out the string to only show the file sizes
      sizeInfo,
    };

    FirmwareCompilationManager.addFirmwareCleanupTask(appPath, config);

    return config;
  };

  static addFirmwareCleanupTask = (
    appFolderPath: string,
    config: CompilationResponse,
  ) => {
    const configPath = path.join(appFolderPath, 'config.json');
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify(config));
    }
    const currentDate = new Date();
    const difference =
      new Date(config.expires_at).getTime() - currentDate.getTime();
    setTimeout((): void => rmfr(appFolderPath), difference);
  };
}

if (IS_COMPILATION_ENABLED) {
  // Delete all expired binaries or queue them up to eventually be deleted.
  if (!fs.existsSync(settings.BUILD_DIRECTORY)) {
    mkdirp.sync(settings.BUILD_DIRECTORY);
  }
  if (!fs.existsSync(BIN_PATH)) {
    mkdirp.sync(BIN_PATH);
  }

  fs.readdirSync(USER_APP_PATH).forEach((file: string) => {
    const appFolder = path.join(USER_APP_PATH, file);
    const configPath = path.join(appFolder, 'config.json');
    if (!fs.existsSync(configPath)) {
      return;
    }

    const configString = fs.readFileSync(configPath, 'utf8');
    if (!configString) {
      return;
    }
    const config = JSON.parse(configString);
    if (config.expires_at < new Date()) {
      // TODO - clean up artifacts in the firmware folder. Every binary will have
      // files in firmare/build/target/user & firmware/build/target/user-part
      // It might make the most sense to just create a custom MAKE file to do this
      rmfr(configPath);
      rmfr(path.join(BIN_PATH, config.binary_id));
    } else {
      FirmwareCompilationManager.addFirmwareCleanupTask(appFolder, config);
    }
  });
}

export default FirmwareCompilationManager;
