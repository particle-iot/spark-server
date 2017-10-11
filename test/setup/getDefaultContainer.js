// @flow

import { Container } from 'constitute';
import defaultBindings from '../../src/defaultBindings';
import settings from './settings';
import DeviceServerMock from './DeviceServerMock';

const container = new Container();
// TODO - we should be creating different bindings per test so we can mock out
// different modules to test
defaultBindings(container, settings);

// settings
container.bindValue('DEVICE_DIRECTORY', settings.DEVICE_DIRECTORY);
container.bindValue('FIRMWARE_DIRECTORY', settings.FIRMWARE_DIRECTORY);
container.bindValue('SERVER_KEY_FILENAME', settings.SERVER_KEY_FILENAME);
container.bindValue('SERVER_KEYS_DIRECTORY', settings.SERVER_KEYS_DIRECTORY);
container.bindValue('USERS_DIRECTORY', settings.USERS_DIRECTORY);
container.bindValue('WEBHOOKS_DIRECTORY', settings.WEBHOOKS_DIRECTORY);

container.bindAlias('DeviceServer', DeviceServerMock);

export default (): Container => container;
