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

    getAccessToken: function (bearerToken) {
    	return when(roles.getTokenInfoByAccessToken(bearerToken));
    },

    getClient: function(clientId, clientSecret) {
    	return when(roles.getClient(clientId, clientSecret));
    },
    
    getUserFromClient: function(client) {
    	return when(roles.getUserByClient(client.client_id));
    },
    
    getRefreshToken: function (bearerToken) {
      	return when(roles.getTokenInfoByRefreshToken(bearerToken));
    },
    
    revokeToken: function (bearerToken) {
    	return when(roles.revokeToken(bearerToken));
    },

    saveToken: function (token, client, user) {
    	return when(roles.addAccessToken(token, client, user));
    },
    
    validateScope: function(user, client, scope) {
    	return scope;
    },

    getUser: function (username, password) {
        if (username && username.toLowerCase) {
            username = username.toLowerCase();
        }

        return when(roles.validateLogin(username, password));
    }
};

module.exports = OAuth2ServerModel;

