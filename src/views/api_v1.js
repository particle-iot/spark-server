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

var settings = require('../settings.js');

var CoreController = require('../lib/CoreController.js');
var roles = require('../lib/RolesController.js');

var sequence = require('when/sequence');
var parallel = require('when/parallel');
var pipeline = require('when/pipeline');

var logger = require('../lib/logger.js');
var utilities = require("../lib/utilities.js");

var fs = require('fs');
var when = require('when');
var util = require('util');
var path = require('path');
var ursa = require('ursa');
var moment = require('moment');

/*
 * TODO: modularize duplicate code
 * TODO: implement proper session handling / user authentication
 * TODO: add cors handler without losing :params support
 *
 */

var Api = {
	loadViews: function (app) {

		//our middleware
		app.param("coreid", Api.loadCore);


		//core functions / variables
		app.post('/v1/devices/:coreid/:func', Api.fn_call);
		app.get('/v1/devices/:coreid/:var', Api.get_var);

		app.put('/v1/devices/:coreid', Api.set_core_attributes);
		app.get('/v1/devices/:coreid', Api.get_core_attributes);

		//doesn't need per-core permissions, only shows owned cores.
		app.get('/v1/devices', Api.list_devices);

		app.post('/v1/provisioning/:coreid', Api.provision_core);

		//app.delete('/v1/devices/:coreid', Api.release_device);
		app.post('/v1/devices', Api.claim_device);

	},

	getSocketID: function (userID) {
		return userID + "_" + global._socket_counter++;
	},

	getUserID: function (req) {
		if (!req.user) {
			logger.log("User obj was empty");
			return null;
		}
		//req.user.id is set in authorise.validateAccessToken in the OAUTH code
		return req.user.id;
	},

	list_devices: function (req, res) {
		var userid = Api.getUserID(req);
		logger.log("ListDevices", { userID: userid });

		//give me all the cores

		var allCoreIDs = global.server.getAllCoreIDs(),
			devices = [],
			connected_promises = [];

		for (var coreid in allCoreIDs) {
			if (!coreid) {
				continue;
			}

			var core = global.server.getCoreAttributes(coreid);

			var device = {
				id: coreid,
				name: (core) ? core.name : null,
				last_app: core ? core.last_flashed_app_name : null,
				last_heard: null
			};

			if (utilities.check_requires_update(core, settings.cc3000_driver_version)) {
				device["requires_deep_update"] = true;
			}

			devices.push(device);
			connected_promises.push(Api.isDeviceOnline(userid, device.id));
		}

		logger.log("ListDevices... waiting for connected state to settle ", { userID: userid });

		//switched 'done' to 'then' - threw an exception with 'done' here.
		when.settle(connected_promises).then(function (descriptors) {
			for (var i = 0; i < descriptors.length; i++) {
				var desc = descriptors[i];

				devices[i].connected = ('rejected' !== desc.state);
				devices[i].last_heard = (desc.value) ? desc.value.lastPing : null;
			}

			res.json(200, devices);
		});
	},

	get_core_attributes: function (req, res) {
		var userid = Api.getUserID(req);
		var socketID = Api.getSocketID(userid),
			coreID = req.coreID,
			socket = new CoreController(socketID);


		logger.log("GetAttr", { coreID: coreID, userID: userid.toString() });

		var objReady = parallel([
			function () {
				return when.resolve(global.server.getCoreAttributes(coreID));
			},
			function () {
				return utilities.alwaysResolve(socket.sendAndListenForDFD(coreID, { cmd: "Describe" }, { cmd: "DescribeReturn" }));
			}
		]);

		//whatever we get back...
		when(objReady).done(function (results) {
			try {

				if (!results || (results.length != 2)) {
					logger.error("get_core_attributes results was the wrong length " + JSON.stringify(results));
					res.json(404, "Oops, I couldn't find that core");
					return;
				}


				//we're expecting descResult to be an array: [ sender, {} ]
				var doc = results[0],
					descResult = results[1],
					coreState = null;

				if (!doc || !doc.coreID) {
					logger.error("get_core_attributes 404 error: " + JSON.stringify(doc));
					res.json(404, "Oops, I couldn't find that core");
					return;
				}

				if (util.isArray(descResult) && (descResult.length > 1)) {
					coreState = descResult[1].state || {};
				}
				if (!coreState) {
					logger.error("get_core_attributes didn't get description: " + JSON.stringify(descResult));
				}

				var device = {
					id: doc.coreID,
					name: doc.name || null,
					last_app: doc.last_flashed,
					connected: !!coreState,
					variables: (coreState) ? coreState.v : null,
					functions: (coreState) ? coreState.f : null,
					cc3000_patch_version: doc.cc3000_driver_version
				};

				if (utilities.check_requires_update(doc, settings.cc3000_driver_version)) {
					device["requires_deep_update"] = true;
				}

				res.json(device);
			}
			catch (ex) {
				logger.error("get_core_attributes merge error: " + ex);
				res.json(500, { Error: "get_core_attributes error: " + ex });
			}
		}, null);

		//get_core_attribs - end
	},


	set_core_attributes: function (req, res) {
		var coreID = req.coreID;
		var userid = Api.getUserID(req);

		var promises = [];

		logger.log("set_core_attributes", { coreID: coreID, userID: userid.toString() });

		var coreName = req.body ? req.body.name : null;
		if (coreName != null) {
			logger.log("SetAttr", { coreID: coreID, userID: userid.toString(), name: coreName });

			global.server.setCoreAttribute(req.coreID, "name", coreName);
			promises.push(when.resolve({ ok: true, name: coreName }));
		}

		var hasFiles = req.files && req.files.file;
		if (hasFiles) {
			//oh hey, you want to flash firmware?
			promises.push(Api.compile_and__or_flash_dfd(req));
		}

		var signal = req.body && req.body.signal;
		if (signal) {
			//get your hands up in the air!  Or down.
			promises.push(Api.core_signal_dfd(req));
		}

		var flashApp = req.body ? req.body.app : null;
		if (flashApp) {
			// It makes no sense to flash a known app and also
			// either signal or flash a file sent with the request
			if (!hasFiles && !signal) {

				// MUST sanitize app name here, before sending to Device Service
				if (utilities.contains(settings.known_apps, flashApp)) {
					promises.push(Api.flash_known_app_dfd(req));
				}
				else {
					promises.push(when.reject("Can't flash unknown app " + flashApp));
				}
			}
		}

		var app_id = req.body ? req.body.app_id : null;
		if (app_id && !hasFiles && !signal && !flashApp) {
			//we have an app id, and no files, and stuff
			//we must be flashing from the db!
			promises.push(Api.flash_app_in_db_dfd(req));
		}

		var app_example_id = req.body ? req.body.app_example_id : null;
		if (app_example_id && !hasFiles && !signal && !flashApp && !app_id) {
			//we have an app id, and no files, and stuff
			//we must be flashing from the db!
			promises.push(Api.flash_example_app_in_db_dfd(req));
		}


		if (promises.length >= 1) {
			when.all(promises).done(
				function (results) {
					var aggregate = {};
					for (var i in results) {
						for (var key in results[i]) {
							aggregate[key] = results[i][key];
						}
					}
					res.json(aggregate);
				},
				function (err) {
					res.json({ ok: false, errors: [err] });
				}
			);
		}
		else {
			logger.error("set_core_attributes - nothing to do?", { coreID: coreID, userID: userid.toString() });
			res.json({error: "Nothing to do?"});
		}
	},


	isDeviceOnline: function (userID, coreID) {
		var tmp = when.defer();

		var socketID = Api.getSocketID(userID);
		var socket = new CoreController(socketID);

		var failTimer = setTimeout(function () {
			logger.log("isDeviceOnline: Ping timed out ", { coreID: coreID });
			socket.close();
			tmp.reject("Device is not connected");
		}, settings.isCoreOnlineTimeout);


		//setup listener for response back from the device service
		socket.listenFor(coreID, { cmd: "Pong" }, function (sender, msg) {
			clearTimeout(failTimer);
			socket.close();

			logger.log("isDeviceOnline: Device service thinks it is online... ", { coreID: coreID });

			if (msg && msg.online) {
				tmp.resolve(msg);
			}
			else {
				tmp.reject(["Core isn't online", 404]);
			}

		}, true);

		logger.log("isDeviceOnline: Pinging core... ", { coreID: coreID });

		//send it along to the device service
		if (!socket.send(coreID, { cmd: "Ping" })) {
			tmp.reject("send failed");
		}

		return tmp.promise;
	},


	claim_device: function (req, res) {
		res.json({ ok: true });
	},


	loadCore: function (req, res, next) {
		req.coreID = req.param('coreid') || req.body.id;

		//load core info!
		req.coreInfo = {
			"last_app": "",
			"last_heard": new Date(),
			"connected": false,
			"deviceID": req.coreID
		};

		//if that user doesn't own that coreID, maybe they sent us a core name
		var userid = Api.getUserID(req);
		var gotCore = utilities.deferredAny([
			function () {
				var core = global.server.getCoreAttributes(req.coreID);
				if (core && core.coreID) {
					return when.resolve(core);
				}
				else {
					return when.reject();
				}
			},
			function () {
				var core = global.server.getCoreByName(req.coreID);
				if (core && core.coreID) {
					return when.resolve(core);
				}
				else {
					return when.reject();
				}
			}
		]);

		when(gotCore).then(
			function (core) {
				if (core) {
					req.coreID = core.coreID || req.coreID;
					req.coreInfo = {
						last_handshake_at: core.last_handshake_at
					};
				}

				next();
			},
			function (err) {
				//s`okay.
				next();
			})
	},

	get_var: function (req, res) {
		var userid = Api.getUserID(req);
		var socketID = Api.getSocketID(userid),
			coreID = req.coreID,
			varName = req.param('var'),
			format = req.param('format');

		logger.log("GetVar", {coreID: coreID, userID: userid.toString()});


		//send it along to the device service
		//and listen for a response back from the device service
		var socket = new CoreController(socketID);
		var coreResult = socket.sendAndListenForDFD(coreID,
			{ cmd: "GetVar", name: varName },
			{ cmd: "VarReturn", name: varName },
			settings.coreRequestTimeout
		);

		//sendAndListenForDFD resolves arr to ==> [sender, msg]
		when(coreResult)
			.then(function (arr) {
				var msg = arr[1];
				if (msg.error) {
					//at this point, either we didn't get a describe return, or that variable
					//didn't exist, either way, 404
					return res.json(404, {
						ok: false,
						error: msg.error
					});
				}

				//TODO: make me look like the spec.
				msg.coreInfo = req.coreInfo;
				msg.coreInfo.connected = true;

				if (format && (format == "raw")) {
					return res.send("" + msg.result);
				}
				else {
					return res.json(msg);
				}
			},
			function () {
				res.json(408, {error: "Timed out."});
			}
		).ensure(function () {
				socket.close();
			});
	},

	fn_call: function (req, res) {
		var user_id = Api.getUserID(req),
			coreID = req.coreID,
			funcName = req.params.func,
			format = req.params.format;

		logger.log("FunCall", { coreID: coreID, user_id: user_id.toString() });

		var socketID = Api.getSocketID(user_id);
		var socket = new CoreController(socketID);
		var core = socket.getCore(coreID);


		var args = req.body;
		delete args.access_token;
		logger.log("FunCall - calling core ", { coreID: coreID, user_id: user_id.toString() });
		var coreResult = socket.sendAndListenForDFD(coreID,
			{ cmd: "CallFn", name: funcName, args: args },
			{ cmd: "FnReturn", name: funcName },
			settings.coreRequestTimeout
		);

		//sendAndListenForDFD resolves arr to ==> [sender, msg]
		when(coreResult)
			.then(
			function (arr) {
				var sender = arr[0], msg = arr[1];

				try {
					//logger.log("FunCall - heard back ", { coreID: coreID, user_id: user_id.toString() });
					if (msg.error && (msg.error.indexOf("Unknown Function") >= 0)) {
						res.json(404, {
							ok: false,
							error: "Function not found"
						});
					}
					else if (msg.error != null) {
						res.json(400, {
							ok: false,
							error: msg.error
						});
					}
					else {
						if (format && (format == "raw")) {
							res.send("" + msg.result);
						}
						else {
							res.json({
								id: core.coreID,
								name: core.name || null,
								last_app: core.last_flashed_app_name || null,
								connected: true,
								return_value: msg.result
							});
						}
					}
				}
				catch (ex) {
					logger.error("FunCall handling resp error " + ex);
					res.json(500, {
						ok: false,
						error: "Error while api was rendering response"
					});
				}
			},
			function () {
				res.json(408, {error: "Timed out."});
			}
		).ensure(function () {
				socket.close();
			});

		//socket.send(coreID, { cmd: "CallFn", name: funcName, args: args });

		// send the function call along to the device service
	},

	/**
	 * Ask the core to start / stop the "RaiseYourHand" signal
	 * @param req
	 */
	core_signal_dfd: function (req) {
		var tmp = when.defer();

		var userid = Api.getUserID(req),
			socketID = Api.getSocketID(userid),
			coreID = req.coreID,
			showSignal = parseInt(req.body.signal);

		logger.log("SignalCore", { coreID: coreID, userID: userid.toString()});

		var socket = new CoreController(socketID);
		var failTimer = setTimeout(function () {
			socket.close();
			tmp.reject({error: "Timed out, didn't hear back"});
		}, settings.coreSignalTimeout);

		//listen for a response back from the device service
		socket.listenFor(coreID, { cmd: "RaiseHandReturn"},
			function () {
				clearTimeout(failTimer);
				socket.close();

				tmp.resolve({
					id: coreID,
					connected: true,
					signaling: showSignal === 1
				});
			}, true);


		//send it along to the core via the device service
		socket.send(coreID, { cmd: "RaiseHand", args: { signal: showSignal } });

		return tmp.promise;
	},

	compile_and__or_flash_dfd: function (req) {
		var allDone = when.defer();
		var userid = Api.getUserID(req),
			coreID = req.coreID;


		//
		//  Did they pass us a source file or a binary file?
		//
		var hasSourceFiles = false;
		var sourceExts = [".cpp", ".c", ".h", ".ino" ];
		if (req.files) {
			for (var name in req.files) {
				if (!req.files.hasOwnProperty(name)) {
					continue;
				}

				var ext = utilities.getFilenameExt(req.files[name].path);
				if (utilities.contains(sourceExts, ext)) {
					hasSourceFiles = true;
					break;
				}
			}
		}


		if (hasSourceFiles) {
			//TODO: federate?
			allDone.reject("Not yet implemented");
		}
		else {
			//they sent a binary, just flash it!
			var flashDone = Api.flash_core_dfd(req);

			//pipe rejection / resolution of flash to response
			utilities.pipeDeferred(flashDone, allDone);
		}

		return allDone.promise;
	},


	/**
	 * Flashing firmware to the core, binary file!
	 * @param req
	 * @returns {promise|*|Function|Promise|when.promise}
	 */
	flash_core_dfd: function (req) {
		var tmp = when.defer();

		var userid = Api.getUserID(req),
			socketID = Api.getSocketID(userid),
			coreID = req.coreID;

		logger.log("FlashCore", {coreID: coreID, userID: userid.toString()});

		var args = req.query;
		delete args.coreid;

		if (req.files) {
			args.data = fs.readFileSync(req.files.file.path);
		}

		var socket = new CoreController(socketID);
		var failTimer = setTimeout(function () {
			socket.close();
			tmp.reject({error: "Timed out."});
		}, settings.coreFlashTimeout);

		//listen for the first response back from the device service
		socket.listenFor(coreID, { cmd: "Event", name: "Update" },
			function (sender, msg) {
				clearTimeout(failTimer);
				socket.close();

				var response = { id: coreID, status: msg.message };
				if ("Update started" === msg.message) {
					tmp.resolve(response);
				}
				else {
					logger.error("flash_core_dfd rejected ", response);
					tmp.reject(response);
				}

			}, true);

		//send it along to the device service
		socket.send(coreID, { cmd: "UFlash", args: args });

		return tmp.promise;
	},

	 provision_core: function (req, res) {
		//if we're here, the user should be allowed to provision cores.

		var done = Api.provision_core_dfd(req);
		when(done).then(
			function (result) {
				res.json(result);
			},
			function (err) {
				//different status code here?
				res.json(400, err);
			});
	},

	provision_core_dfd: function (req) {
		var result = when.defer(),
			userid = Api.getUserID(req),
			deviceID =  req.body.deviceID,
			publicKey =  req.body.publicKey;

		if (!deviceID) {
			return when.reject({ error: "No deviceID provided" });
		}

		try {
			var keyObj = ursa.createPublicKey(publicKey);
			if (!publicKey || (!ursa.isPublicKey(keyObj))) {
				return when.reject({ error: "No key provided" });
			}
		}
		catch (ex) {
			logger.error("error while parsing publicKey " + ex);
			return when.reject({ error: "Key error " + ex });
		}


		global.server.addCoreKey(deviceID, publicKey);
		global.server.setCoreAttribute(deviceID, "registrar", userid);
		global.server.setCoreAttribute(deviceID, "timestamp", new Date());
		result.resolve("Success!");

		return result.promise;
	},


	_: null
};

exports = module.exports = Api;
