'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var deviceToAPI = function deviceToAPI(device, result) {
  return {
    cellular: device.isCellular,
    connected: device.connected,
    current_build_target: device.currentBuildTarget,
    functions: device.functions || null,
    id: device.deviceID,
    imei: device.imei,
    last_app: device.lastFlashedAppName,
    last_heard: device.lastHeard,
    last_iccid: device.last_iccid,
    last_ip_address: device.ip,
    name: device.name,
    platform_id: device.particleProductId,
    product_firmware_version: device.productFirmwareVersion,
    product_id: device.particleProductId,
    return_value: result,
    status: 'normal',
    variables: device.variables || null
  };
};

exports.default = deviceToAPI;