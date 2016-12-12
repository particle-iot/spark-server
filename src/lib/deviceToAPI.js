// @flow

import type { Device } from '../types';

export type DeviceAPIType = {|
  cellular: boolean,
  connected: boolean,
  current_build_target: string,
  id: string,
  last_app: ?string,
  last_heard: ?Date,
  last_ip_address: ?string,
  name: string,
  platform_id: number,
  product_id: number,
  return_value?: mixed,
  status: string,
|};

const deviceToAPI = (device: Device, result?: mixed): DeviceAPIType => ({
  cellular: false, // TODO: populate this from device.
  connected: device.connected,
  current_build_target: '', // TODO: populate this as well :(
  id: device.deviceID,
  last_app: device.lastFlashedAppName,
  last_heard: device.lastHeard,
  last_ip_address: device.ip,
  name: device.name,
  platform_id: device.particleProductId,
  product_id: device.particleProductId,
  return_value: result,
  status: 'normal', // TODO: populate this from device
});

export default deviceToAPI;
