var crypto = require('crypto');

var PasswordHasher = function () {

};

PasswordHasher.generateSalt = function (callback) {
    return crypto.randomBytes(64, callback);
};

PasswordHasher.hash = function (password, salt, callback) {
    password = password.toString('base64');
    salt = salt.toString('base64');
    return crypto.pbkdf2(password, salt, 30000, 64, function (err, derivedKey) {
        return callback(err, derivedKey.toString('base64'));
    });
};

module.exports = PasswordHasher;
