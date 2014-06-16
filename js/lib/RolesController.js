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
    init: function() {

    },

    _loadAndCacheUsers: function() {

        // list files, load all user objects, index by access_tokens and usernames


        //settings.userDataDir
    },


    getUserByToken: function(access_token) {

    },


    validateLogin: function(username, password) {
        return pipeline([

            //grab and parse the user file
            function () {
                var userFile = path.join(settings.userDataDir, credentials.username);
                return utilities.promiseGetJsonFile(userFile);
            },

            //do hash / compare
            function (userObj) {
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
            }
        ]);


    },
    getUserObj: function(username) {

    }
};

var obj = new RolesController();
module.exports = global.roles = obj;