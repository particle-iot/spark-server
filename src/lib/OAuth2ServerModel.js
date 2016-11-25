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

