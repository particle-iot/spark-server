// @flow

class SparkCoreMock {
  onApiMessage() {
    return true;
  }

  getVariableValue = (): Object => 0;

  getDescription = (): Object => ({
    firmware_version: '0.6.0',
    product_id: '6',
    state: {
      f: null,
      v: null,
    },
  });

  ping = (): Object => ({
    connected: false,
    lastPing: new Date(),
  });
}

export default SparkCoreMock;
