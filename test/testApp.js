// @flow

import createApp from '../src/app';
import settings from './settings';

// TODO: mock the server or create a bootstrapper so there is only one instance
// of the device server
export default createApp(settings, {});
