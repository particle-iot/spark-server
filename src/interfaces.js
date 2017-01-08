
class Abstract {
  constructor() {
    if (new.target === Abstract) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
  }
}

class IDeviceFirmwareRepository extends Abstract {}
class IDeviceRepository extends Abstract {}
class IEventManager extends Abstract {}
class IUserRepository extends Abstract {}
class IWebhookRepository extends Abstract {}

export {
  IDeviceFirmwareRepository,
  IDeviceRepository,
  IEventManager,
  IUserRepository,
  IWebhookRepository,
};
