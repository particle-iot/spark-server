var fs = require('fs');
var path = require('path');
var when = require('when');
var sequence = require('when/sequence');
var pipeline = require('when/pipeline');
var PasswordHasher = require('./PasswordHasher.js');
var roles = require('./RolesController.js');
var settings = require('../settings.js');


function RolesController() {
    this.init();
}

module.exports = that = {
    users: null,
    usersByToken: null,
    usersByUsername: null,


    init: function () {
        this._loadAndCacheUsers();
    },

    addUser: function (userObj) {
        this.users.push(userObj);
        this.usersByUsername[ userObj.username ] = userObj;

        if (userObj.access_token) {
            this.usersByToken[userObj.access_token] = userObj;
        }

        for (var i = 0; i < userObj.access_tokens.length; i++) {
            var token = userObj.access_tokens[i];
            this.usersByToken[ token ] = userObj;
        }
    },
    destroyAccessToken: function(access_token) {
        var userObj = this.usersByToken[access_token];
        if (!userObj) {
            return true;
        }

        delete this.usersByToken[access_token];
        if (userObj.access_token == access_token) {
            userObj.access_token = null;
        }
        var idx = utilities.indexOf(userObj.access_tokens, req.params.token);
        if (idx >= 0) {
            userObj.access_tokens.splice(idx, 1);
        }

        this.saveUser();
    },

    saveUser: function(userObj) {
        var userFile = path.join(settings.userDataDir, userObj.username);
        var userJson = JSON.stringify(userObj);
        fs.writeFileSync(userFile, userJson);

    },

    _loadAndCacheUsers: function () {
        this.users = [];
        this.usersByToken = {};
        this.usersByUsername = {};


        // list files, load all user objects, index by access_tokens and usernames

        var files = fs.readdirSync(settings.userDataDir);
        for (var i = 0; i < files.length; i++) {
            try {
                var filename = files[i];
                var userObj = JSON.parse(fs.readFileSync(filename));
                this.addUser(userObj);
            }
            catch (ex) {
                logger.error("RolesController - error loading user at " + filename);
            }
        }
    },


    getUserByToken: function (access_token) {
        return this.usersByToken[access_token];
    },

    getUserByName: function (username) {
        return this.usersByUsername(username);
    },


    validateHashPromise: function (userObj, password) {
        var tmp = when.defer();

        PasswordHasher.hash(credentials.password, user.salt, function (err, hash) {
            if (err) {
                logger.error("hash error " + err);
                tmp.reject("Bad password");
            }
            else if (hash === userObj.password_hash) {
                tmp.resolve(userObj);
            }
            else {
                tmp.reject("Bad password");
            }
        });

        return tmp.promise;
    },


    validateLogin: function (username, password) {
        var userObj = this.getUserByName(username);
        if (!userObj) {
            return when.reject("Bad password");
        }

        return this.validateHashPromise(userObj, password);
    },
};

var obj = new RolesController();
module.exports = global.roles = obj;