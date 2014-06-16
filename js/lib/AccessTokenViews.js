var fs = require('fs');
var path = require('path');
var when = require('when');
var sequence = require('when/sequence');
var pipeline = require('when/pipeline');
var PasswordHasher = require('./PasswordHasher.js');
var roles = require('./RolesController.js');

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

        //if successful, should return something like:
        //  [ { token: d.token, expires_at: d.expires_at, client: d.client_id } ]

        when(roles.validateLogin(credentials.username, credentials.password))
            .then(
            function (userObj) {
                res.json(userObj.access_tokens);
            },
            function () {
                res.json(401, { ok: false, errors: ['Bad password']});
            });
    },

    destroy: function (req, res) {
        var credentials = AccessTokenViews.basicAuth(req);
        if (!credentials) {
            return res.json(401, {
                ok: false,
                errors: ["Unauthorized. You must send username and password in HTTP Basic Auth to delete an access token."]
            });
        }

        when(roles.validateLogin(credentials.username, credentials.password))
            .then(
            function (userObj) {
                try {
                    roles.destroyAccessToken(req.params.token);
                    res.json({ ok: true });
                }
                catch (ex) {
                    logger.error("error saving user " + ex);
                    res.json(401, { ok: false, errors: ['Error updating token']});
                }
            },
            function () {
                res.json(401, { ok: false, errors: ['Bad password']});
            });
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
