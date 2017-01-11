// @flow

import {HalDescribeParser} from 'binary-version-reader';

// TODO - these should be written to a non-configurable folder like
// `../third-party`
import settings from '../data/binaries/settings';
import specifications from '../data/binaries/specifications';
import versions from '../data/binaries/versions';

type OtaUpdate = {
  address: string,
  alt: string,
  binaryFileName: string,
};

const platformSettings = Object.entries(specifications);
const SPECIFICATION_KEY_BY_PLATFORM = new Map(
  Object.values(settings.knownPlatforms).map(
    platform => {
      const spec = platformSettings.find(
        ([key, value]) => (value: any).productName === platform,
      );

      return [platform, spec && spec[0]]
    },
  ).filter(item => item[1]),
);
const MAX_RELEASE_VERSION = Math.max(
  ...versions
    // Filter out Release Candidates and only use release versions
    .filter(version => !version[1].includes('rc'))
    .map(version => Number.parseInt(version[0])),
);

class FirmwareManager {
  _modules: Array<Object>;
  _platform: string;
  _systemVersion: number;

  constructor(description: Object) {
    const parser = new HalDescribeParser();
    this._platform = settings.knownPlatforms[description.p + ''];
    this._systemVersion = parser.getSystemVersion(description);
    this._modules = parser.getModules(description);
  }

  getModules(): Array<Object> {
    return this._modules;
  }

  getPlatform(): string {
    return this._platform;
  }

  getSystemVersion(): number {
    return this._systemVersion;
  }

  // Gets OTA updates if the device needs to be updated
  getOtaUpdateConfig(): ?Array<OtaUpdate> {
    if (this._systemVersion >= MAX_RELEASE_VERSION) {
      //return null;
    }

    const key = SPECIFICATION_KEY_BY_PLATFORM.get(this._platform);

    if (!key) {
      return null;
    }

    const firmwareSettings = settings.updates[key];
    if (!key) {
      return null;
    }

    const firmwareKeys = Object.keys(firmwareSettings);
    return firmwareKeys.map(firmwareKey => ({
      ...specifications[key][firmwareKey],
      binaryFileName: firmwareSettings[firmwareKey],
    }));
  }

  getKnownAppFileName(): ?string {
    throw new Error('getKnownAppFileName has not been implemented.')
  }
}

export default FirmwareManager;
