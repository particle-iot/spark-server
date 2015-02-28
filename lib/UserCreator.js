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
*/


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

