// @flow

import fs from 'fs';
import github from 'github';
import mkdirp from 'mkdirp';
import request from 'request';
import rmfr from 'rmfr';
import settings from '../src/settings';
import nullthrows from 'nullthrows';

type Asset = {
  browser_download_url: string,
  name: string,
};

const GITHUB_USER = 'spark';
const GITHUB_FIRMWARE_REPOSITORY = 'firmware';
const GITHUB_CLI_REPOSITORY = 'particle-cli';
const MAPPING_FILE = settings.BINARIES_DIRECTORY + '/versions.json';
const SPECIFICATIONS_FILE = settings.BINARIES_DIRECTORY + '/specifications.js';
const SETTINGS_FILE = settings.BINARIES_DIRECTORY + '/settings.json';

// This default is here so that the regex will work when updating these files.
const DEFAULT_SETTINGS = {
  knownApps: {
		'deep_update_2014_06': true,
		'cc3000': true,
		'cc3000_1_14': true,
		'tinker': true,
		'voodoo': true
	},
	knownPlatforms: {
		'0': 'Core',
		'6': 'Photon',
		'8': 'P1',
		'10': 'Electron',
		'88': 'Duo',
		'103': 'Bluz'
	},
	updates: {
		'2b04:d006': {
			systemFirmwareOne: 'system-part1-0.6.0-photon.bin',
			systemFirmwareTwo: 'system-part2-0.6.0-photon.bin'
		},
		'2b04:d008': {
			systemFirmwareOne: 'system-part1-0.6.0-p1.bin',
			systemFirmwareTwo: 'system-part2-0.6.0-p1.bin'
		},
		'2b04:d00a': {
			// The bin files MUST be in this order to be flashed to the correct memory locations
			systemFirmwareOne:   'system-part2-0.6.0-electron.bin',
			systemFirmwareTwo:   'system-part3-0.6.0-electron.bin',
			systemFirmwareThree: 'system-part1-0.6.0-electron.bin'
		}
	},
};

let versionTag = '';
const githubAPI = new github();

const exitWithMessage = (message: string): void => {
	console.log(message);
	process.exit(0);
};

const cleanBinariesDirectory = async (): Promise<*> => {
	return rmfr(settings.BINARIES_DIRECTORY + '/');
};

const exitWithJSON = (json: Object): void => {
	exitWithMessage(JSON.stringify(json, null, 2));
}

const downloadFile = (url: string): Promise<*> => {
	return new Promise((resolve, reject) => {
		const filename = nullthrows(url.match(/.*\/(.*)/))[1];
		console.log('Downloading ' + filename + '...');
		const file = fs.createWriteStream(
      settings.BINARIES_DIRECTORY +
      '/' +
      filename
    );
    file.on('finish', () => file.close(() => resolve(filename)));
		request(url).pipe(file).on('error', exitWithJSON);
	});
};

const downloadFirmwareBinaries = async (
  assets: Array<Asset>,
): Promise<*> => {
	const assetFileNames = await Promise.all(assets.map(asset => {
		if (asset.name.match(/^system-part/)) {
			return downloadFile(asset.browser_download_url);
		}
    return '';
	}));

  return assetFileNames.filter(item => item);
};

const updateSettings = (): Array<string> => {
	let versionNumber = versionTag;
	if (versionNumber[0] === 'v') {
		versionNumber = versionNumber.substr(1);
	}

	let settings = JSON.stringify(DEFAULT_SETTINGS, null, 2);
  const settingsBinaries = [];
	settings = settings.replace(
    /(system-part\d-).*(-.*.bin)/g,
    (filename, part, device) => {
  		var newFilename = part + versionNumber + device;
  		settingsBinaries.push(newFilename);
  		return newFilename;
  	}
  );

	fs.writeFileSync(SETTINGS_FILE, settings, { flag: 'wx' });
	console.log('Updated settings');

  return settingsBinaries;
};

const verifyBinariesMatch = (
  downloadedBinaries: Array<string>,
  settingsBinaries: Array<string>,
): void => {
	downloadedBinaries = downloadedBinaries.sort();
	settingsBinaries = settingsBinaries.sort();
	if (JSON.stringify(downloadedBinaries) !== JSON.stringify(settingsBinaries)) {
		console.log(
      '\n\nWARNING: the list of downloaded binaries doesn\'t match the list ' +
        'of binaries in settings.js'
    );
		console.log('Downloaded:  ', downloadedBinaries);
		console.log('settings.js: ', settingsBinaries);
	}
};

const downloadAppBinaries = async (): Promise<*> => {
  const assets = await githubAPI.repos.getContent({
    owner: GITHUB_USER,
    repo: GITHUB_CLI_REPOSITORY,
    path: 'binaries'
  });

  return await Promise.all(
    assets.map(asset => downloadFile(asset.download_url)),
  );
};

(async (): Promise<*> => {
  // Start running process. If you pass `0.6.0` it will install that version of
  // the firmware.
  versionTag = process.argv[2];
  if (versionTag && versionTag[0] !== 'v') {
  	versionTag = 'v' + versionTag;
  }


  await cleanBinariesDirectory();
  if (!fs.existsSync(settings.BINARIES_DIRECTORY)) {
    mkdirp.sync(settings.BINARIES_DIRECTORY);
  }

  // Download app binaries
  await downloadAppBinaries();

  // Download firmware binaries
  if (process.argv.length !== 3) {
    let tags = await githubAPI.repos.getTags({
      owner: GITHUB_USER,
      page: 0,
      perPage: 30,
      repo: GITHUB_FIRMWARE_REPOSITORY
    })
    tags = tags.filter(tag =>
      // Don't use release candidates.. we only need main releases.
      !tag.name.includes('-rc') &&
      !tag.name.includes('-pi')
    );

    tags.sort((a, b) => {
      if (a.name < b.name) {
        return 1;
      }
      if (a.name > b.name) {
        return -1;
      }
      return 0;
    });

    versionTag = tags[0].name;
  }

  const release = await githubAPI.repos.getReleaseByTag({
    owner: GITHUB_USER,
    repo: GITHUB_FIRMWARE_REPOSITORY,
    tag: versionTag
  });

  const downloadedBinaries = await downloadFirmwareBinaries(release.assets);
  const settingsBinaries = await updateSettings();
  verifyBinariesMatch(downloadedBinaries, settingsBinaries);

  const specificationsResponse = await githubAPI.repos.getContent({
    owner: GITHUB_USER,
    path: 'lib/deviceSpecs/specifications.js',
    repo: GITHUB_CLI_REPOSITORY
  });

  fs.writeFileSync(
    SPECIFICATIONS_FILE,
    new Buffer(specificationsResponse.content, 'base64').toString(),
    { flag: 'wx' }
  );

  const versionResponse = await githubAPI.repos.getContent({
    owner: GITHUB_USER,
    path: 'system/system-versions.md',
    repo: GITHUB_FIRMWARE_REPOSITORY
  })

  const versionText = new Buffer(versionResponse.content, 'base64').toString();
  const startIndex = versionText.indexOf('| 0 ');
  const endIndex = versionText.indexOf('\n\n', startIndex);
  const data = versionText
    .substring(startIndex, endIndex)
    .replace(/\s/g, '')
    .split('|');

  const mapping = [];
  for (var i = 0; i < data.length; i += 4) {
    if (!data[i+1]) {
      continue;
    }
    mapping.push([data[i+1], data[i+2]]);
  }
  fs.writeFileSync(
    MAPPING_FILE,
    JSON.stringify(mapping, null, 2),
    { flag: 'wx' }
  );

  console.log('\r\nCompleted Sync')
})();
