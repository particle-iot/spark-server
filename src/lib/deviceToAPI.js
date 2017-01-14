// @flow

import type { Device } from '../types';

export type DeviceAPIType = {|
  cellular: boolean,
  connected: boolean,
  current_build_target: string,
  functions?: Array<string>,
  id: string,
  imei?: string,
  last_app: ?string,
  last_heard: ?Date,
  last_iccid?: string,
  last_ip_address: ?string,
  name: string,
  platform_id: number,
  product_id: number,
  return_value?: mixed,
  status: string,
  variables?: Object,
|};

const deviceToAPI = (device: Device, result?: mixed): DeviceAPIType => ({
  cellular: device.isCellular,
  connected: device.connected,
  current_build_target: device.currentBuildTarget,
  functions: device.functions,
  imei: device.imei,
  id: device.deviceID,
  last_app: device.lastFlashedAppName,
  last_heard: device.lastHeard,
  last_iccid: device.last_iccid,
  last_ip_address: device.ip,
  name: device.name,
  platform_id: device.particleProductId,
  product_id: device.particleProductId,
  return_value: result,
  status: 'normal',
  variables: device.variables,
});

export default deviceToAPI;
