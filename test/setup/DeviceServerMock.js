// @flow

import SparkCoreMock from './SparkCoreMock';

class DeviceServerMock {
  getDevice(): SparkCoreMock {
    return new SparkCoreMock();
  }
}

export default DeviceServerMock;
