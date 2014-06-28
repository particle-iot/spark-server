var path = require('path');

module.exports = {
    baseUrl: "http://localhost",
    userDataDir: path.join(__dirname, "users"),
    coreKeysDir: path.join(__dirname, "core_keys"),

    coreRequestTimeout: 30000,
    isCoreOnlineTimeout: 2000,

    coreSignalTimeout: 30000,
    coreFlashTimeout: 90000,

    maxHooksPerUser: 20,
    maxHooksPerDevice: 10,
};