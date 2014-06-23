var PasswordHasher = require('./PasswordHasher');
var roles = require('./RolesController.js');
var when = require('when');


var OAuth2ServerModel = function (options) {
    this.options = options;
};
OAuth2ServerModel.prototype = {

    getAccessToken: function (bearerToken, callback) {
        var token = roles.getTokenInfoByToken(bearerToken);
        callback(null, token);
    },

    getClient: function (clientId, clientSecret, callback) {
        return callback(null, { client_id: clientId });
    },

    grantTypeAllowed: function (clientId, grantType, callback) {
        return callback(null, 'password' === grantType);
    },

    saveAccessToken: function (accessToken, clientId, userId, expires, callback) {
        when(roles.addAccessToken(accessToken, clientId, userId, expires))
            .ensure(callback);
    },

    getUser: function (username, password, callback) {
        if (username && username.toLowerCase) {
            username = username.toLowerCase();
        }

        when(roles.validateLogin(username, password))
            .then(
            function (user) {
                callback(null, { id: user._id });
            },
            function (err) {
                callback(err, null);
            });
    }
};

module.exports = OAuth2ServerModel;

