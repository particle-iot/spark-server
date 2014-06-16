var fs = require('fs');
var path = require('path');
var when = require('when');
var sequence = require('when/sequence');
var pipeline = require('when/pipeline');
var PasswordHasher = require('./PasswordHasher.js');


var AccessTokenViews = function (options) {
    this.options = options;
};

AccessTokenViews.prototype = {
    loadViews: function (app) {
        app.get('/v1/access_tokens', this.index.bind(this));
        app.delete('/v1/access_tokens/:token', this.destroy.bind(this));
    },
    index: function (req, res) {
        var credentials = AccessTokenViews.basicAuth(req);
        if (!credentials) {
            return res.json(401, {
                ok: false,
                errors: ["Unauthorized. You must send username and password in HTTP Basic Auth to view your access tokens."]
            });
        }

        pipeline([

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
                        tmp.reject(err);
                        return res.json(400, { ok: false, errors: [err] });
                    }
                    else if (hash === userObj.password_hash) {

                        //  [ { token: d.token, expires_at: d.expires_at, client: d.client_id } ]
                        return res.json(userObj.access_tokens);
                    }
                    else {
                        return res.json(401, { ok: false, errors: ['Bad password']});
                    }
                });

                return tmp.promise;
            }
        ]);
    },

    destroy: function (req, res) {
        var credentials = AccessTokenViews.basicAuth(req);
        if (!credentials) {
            return res.json(401, {
                ok: false,
                errors: ["Unauthorized. You must send username and password in HTTP Basic Auth to delete an access token."]
            });
        }

        var userFile = path.join(settings.userDataDir, credentials.username);

        pipeline([

            //grab and parse the user file
            function () {
                return utilities.promiseGetJsonFile(userFile);
            },

            //do hash / compare
            function (userObj) {
                var tmp = when.defer();

                PasswordHasher.hash(credentials.password, user.salt, function (err, hash) {
                    if (err) {
                        tmp.reject(err);
                        return res.json(400, { ok: false, errors: [err] });
                    }
                    else if (hash === user.password_hash) {
                        tmp.resolve(userObj);
                    }
                    else {
                        return res.json(401, { ok: false, errors: ['Bad password']});
                    }
                });

                return tmp.promise;
            },
            function (userObj) {
                var tmp = when.defer();

                if (userObj.access_token == req.params.token) {
                    userObj.access_token = null;
                }

                var idx = utilities.indexOf(userObj.access_tokens, req.params.token);
                if (idx >= 0) {
                    userObj.access_tokens.splice(idx, 1);
                }


                try {
                    //save user
                    var userJson = JSON.stringify(userObj);
                    fs.writeFileSync(user, userJson);

                    res.json({ ok: true });
                    tmp.resolve();
                }
                catch (ex) {
                    logger.error("error saving userfile " + ex);
                    tmp.reject();
                }

                return tmp.promise;
            }
        ]);
    },

    basicAuth: function (req) {
        var auth = req.get('Authorization');
        if (!auth) return null;

        var matches = auth.match(/Basic\s+(\S+)/);
        if (!matches) return null;

        var creds = new Buffer(matches[1], 'base64').toString();
        var separatorIndex = creds.indexOf(':');
        if (-1 === separatorIndex)
            return null;

        return {
            username: creds.slice(0, separatorIndex),
            password: creds.slice(separatorIndex + 1)
        };
    }

};

module.exports = AccessTokenViews;
