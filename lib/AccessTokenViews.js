/**
*    Copyright (C) 2013-2014 Spark Labs, Inc. All rights reserved. -  https://www.spark.io/
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU Affero General Public License, version 3,
*    as published by the Free Software Foundation.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU Affero General Public License for more details.
*
*    You should have received a copy of the GNU Affero General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*    You can download the source here: https://github.com/spark/spark-server
*/

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
		//  [ { token: d.token, expires: d.expires, client: d.client_id } ]

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
