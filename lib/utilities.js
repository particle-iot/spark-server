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

var os = require('os');
var when = require('when');
var logger = require('./logger.js');
var extend = require('xtend');
var path = require('path');
var fs = require('fs');

var that;
module.exports = that = {

	/**
	 * ensures the function in the provided scope
	 * @param fn
	 * @param scope
	 * @returns {Function}
	 */
	proxy: function (fn, scope) {
		return function () {
			try {
				return fn.apply(scope, arguments);
			}
			catch (ex) {
				logger.error(ex);
				logger.error(ex.stack);
				logger.log('error bubbled up ' + ex);
			}
		}
	},

	/**
	 * Surely there is a better way to do this.
	 * NOTE! This function does NOT short-circuit when an in-equality is detected.  This is
	 * to avoid timing attacks.
	 * @param left
	 * @param right
	 */
	bufferCompare: function (left, right) {
		if ((left == null) && (right == null)) {
			return true;
		}
		else if ((left == null) || (right == null)) {
			return false;
		}

		if (!Buffer.isBuffer(left)) {
			left = new Buffer(left);
		}
		if (!Buffer.isBuffer(right)) {
			right = new Buffer(right);
		}

		logger.log('left: ', left.toString('hex'), ' right: ', right.toString('hex'));

		var same = (left.length == right.length),
			i = 0,
			max = left.length;

		while (i < max) {
			same &= (left[i] == right[i]);
			i++;
		}

		return same;
	},

	/**
	 * Iterates over the properties of the right object, checking to make
	 * sure the properties on the left object match.
	 * @param left
	 * @param right
	 */
	leftHasRightFilter: function (left, right) {
		if (!left && !right) {
			return true;
		}
		var matches = true;

		for (var prop in right) {
			if (!right.hasOwnProperty(prop)) {
				continue;
			}
			matches &= (left[prop] == right[prop]);
		}
		return matches;
	},

	promiseDoFile: function (filename, callback) {
		var deferred = when.defer();
		fs.exists(filename, function (exists) {
			if (!exists) {
				logger.error("File: " + filename + " doesn't exist.");
				deferred.reject();
			}
			else {
				fs.readFile(filename, function (err, data) {
					if (err) {
						logger.error("error reading " + filename, err);
						deferred.reject();
					}

					try {
						if (callback(data)) {
							deferred.resolve();
						}
					}
					catch(ex) {
						deferred.reject(ex);
					}

				});
			}
		});
		return deferred;
	},

	promiseGetJsonFile: function (filename) {
		var deferred = when.defer();

		fs.exists(filename, function (exists) {
			if (!exists) {
				logger.error("File: " + filename + " doesn't exist.");
				deferred.reject();
			}
			else {
				fs.readFile(filename, function (err, data) {
					if (err) {
						logger.error("error reading " + filename, err);
						deferred.reject();
					}

					try {
						var obj = JSON.parse(data);
						deferred.resolve(obj);
					}
					catch(ex) {
						logger.error("Error parsing " + filename + " " + ex);
						deferred.reject(ex);
					}
				});
			}
		});
		return deferred;
	},

	promiseStreamFile: function (filename) {
		var deferred = when.defer();
		fs.exists(filename, function (exists) {
			if (!exists) {
				logger.error("File: " + filename + " doesn't exist.");
				deferred.reject();
			}
			else {
				var readStream = fs.createReadStream(filename);

				//TODO: catch can't read file stuff.

				deferred.resolve(readStream);
			}
		});
		return deferred;
	},

	bufferToHexString: function(buf) {
		if (!buf || (buf.length <= 0)) { return null; }

		var r = [];
		for(var i=0;i<buf.length;i++) {
			if (buf[i] < 10) { r.push('0'); }
			r.push(buf[i].toString(16));
		}
		return r.join('');
	},

	toHexString: function(val) {
		return ((val < 10) ? '0' : '') + val.toString(16);
	},


	/**
	 * filename should be relative from wherever we're running the require, sorry!
	 * @param filename
	 * @returns {*}
	 */
	tryRequire: function (filename) {
		try {
			return require(filename);
		}
		catch (ex) {
			logger.error("tryRequire error " + filename, ex);
		}
		return null;
	},

	tryMixin: function (destObj, newObj) {
		try {
			return extend(destObj, newObj);
		}
		catch (ex) {
			logger.error("tryMixin error" + ex);
		}
		return destObj;
	},


	/**
	 * usage:
	 * var done = timerGenerator();
	 * var elapsed = done();
	 *
	 * @returns {Function}
	 */
	timerGenerator: function() {
		var start = new Date();
		return function() {
			var end = new Date();
			return end - start;
		}
	},

	/**
	 * Makes it easier to use a promise more forgivingly in a parallel list, etc.
	 * @param promise
	 * @returns {promise|*|Function|Promise|when.promise}
	 */
	alwaysResolve: function(promise) {
		var dfd = when.defer();

		when(promise).then(
			function(val) { dfd.resolve(val); },
			function(val) { dfd.resolve(val); });

		return dfd.promise;
	},

	getFilenameExt: function (filename) {
		if (!filename || (filename.length === 0)) {
			return filename;
		}

		var idx = filename.lastIndexOf('.');
		if (idx >= 0) {
			return filename.substr(idx);
		}
		else {
			return filename;
		}
	},
	filenameNoExt: function (filename) {
		if (!filename || (filename.length === 0)) {
			return filename;
		}

		var idx = filename.lastIndexOf('.');
		if (idx >= 0) {
			return filename.substr(0, idx);
		}
		else {
			return filename;
		}
	},

	indexOf: function (arr, val) {
		if (!arr || (arr.length == 0)) {
			return -1;
		}
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == val) {
				return i;
			}
		}
		return -1;
	},
	contains: function (arr, val) {
		return (that.indexOf(arr, val) !== -1);
	},
	pipeDeferred: function(left, right) {
		when(left).then(function() {
			right.resolve.apply(right, arguments);
		}, function() {
			right.reject.apply(right, arguments);
		})
	},

	/**
	 * Non-competitive version of when.any
	 * @param arr
	 */
	deferredAny: function (arr) {
		var tmp = when.defer();
		var index = -1;
		var reasons = [];

		//step through a list of FUNCTIONS that return deferreds,
		//process in order and resolve with the first one that resolves.

		var doNext = function () {
			index++;
			if (index > arr.length) {
				tmp.reject(reasons);
				return;
			}
			else if (!arr[index]) {
				process.nextTick(doNext);
				return;
			}

			var promise = null;
			try {
				promise = arr[index]();
			}
			catch (ex) {
				logger.error("deferredAny - error calling fn in seq index: " + index + " err: " + ex);
			}

			if (promise) {
				when(promise).then(
					function () {
						//chain this forward and resolve!  we're done!
						tmp.resolve.apply(tmp, arguments);
					},
					function (err) {
						reasons.push(err);

						//lets try the next one!
						process.nextTick(doNext);
					});
			}
			else {
				process.nextTick(doNext);
			}
		};

		process.nextTick(doNext);
		return tmp.promise;
	},

	check_requires_update: function(device, target) {
		var version = (device && device["cc3000_patch_version"]);
		return (version && (version < target));
	},

	getIPAddresses: function () {
		//adapter = adapter || "eth0";
		var results = [];
		var nics = os.networkInterfaces();

		for (var name in nics) {
			var nic = nics[name];

			for (var i = 0; i < nic.length; i++) {
				var addy = nic[i];

				if ((addy.family != "IPv4") || (addy.address == "127.0.0.1")) {
					continue;
				}

				results.push(addy.address);
			}
		}

		return results;
	},

	foo: null
};