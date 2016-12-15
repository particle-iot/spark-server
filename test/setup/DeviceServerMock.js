// @flow

import SparkCoreMock from './SparkCoreMock';

class DeviceServerMock {
  getCore(): SparkCoreMock {
    return new SparkCoreMock();
  }
}

export default DeviceServerMock;
