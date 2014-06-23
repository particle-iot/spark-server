//var PasswordHasher = require('./PasswordHasher');
var roles = require('./RolesController.js');
var when = require('when');


var UserCreator = function (options) {
    this.options = options;
};

UserCreator.prototype = {
    create: function (username, password, callback) {
        username = username.toLowerCase();

        roles.createUser(username, password)
            .then(callback, callback);
    },


    getMiddleware: function () {
        var that = this;
        return function (req, res) {
            if ((null != req.body.username) && (null != req.body.password)) {
                var username = req.body.username.toLowerCase();

                return that.create(username, req.body.password, function (err) {
                    if (err) {
                        return res.json({ ok: false, errors: [err] });
                    }
                    else {
                        return res.json({ ok: true });
                    }
                });
            }
            else {
                return res.json({ ok: false, errors: ['username and password required'] });
            }
        };
    }
};

module.exports = new UserCreator();

