// @flow

import type { Device } from '../types';

export type DeviceAPIType = {|
  connected: boolean,
  id: string,
  last_app: ?string,
  last_heard: ?Date,
  name: string;
  return_value?: mixed
|};

const deviceToAPI = (device: Device, result?: mixed): DeviceAPIType => ({
  connected: device.connected,
  id: device.coreID,
  last_app: device.lastFlashedAppName,
  last_heard: device.lastHeard,
  name: device.name,
  return_value: result,
});

export default deviceToAPI;
