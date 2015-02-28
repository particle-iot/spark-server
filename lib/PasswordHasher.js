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
