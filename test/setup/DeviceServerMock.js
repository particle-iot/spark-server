// @flow

import SparkCoreMock from './SparkCoreMock';

class DeviceServerMock {
  getDevice = (): SparkCoreMock => new SparkCoreMock();
}

export default DeviceServerMock;
