// @flow

import createApp from '../../src/app';
import settings from './settings';
import DeviceServerMock from './DeviceServerMock';

const deviceServer = new DeviceServerMock();
const app = createApp(settings, deviceServer);

export default app;
