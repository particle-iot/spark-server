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
var PasswordHasher = require('../lib/PasswordHasher.js');

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

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

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

        app.put('/v1/devices/:coreid', multipartMiddleware, Api.set_core_attributes);
        app.get('/v1/devices/:coreid', Api.get_core_attributes);//ok customer

        //doesn't need per-core permissions, only shows owned cores.
        app.get('/v1/devices', Api.list_devices);//ok customer

        app.post('/v1/provisioning/:coreid', Api.provision_core);

        app.delete('/v1/devices/:coreid', Api.release_device);
        
        app.post('/v1/devices', Api.claim_device);
        app.post('/v1/device_claims', app.oauth.authenticate(), Api.get_claim_code);
        
        /*products*/
        app.get('/v1/products', app.oauth.authenticate(), Api.list_products);
        app.get('/v1/products/:productIdOrSlug', app.oauth.authenticate(), Api.get_product);
        app.post('/v1/products/:productIdOrSlug/device_claims', app.oauth.authenticate(), Api.get_product_claim_code);
        app.delete('/v1/products/:productIdOrSlug/devices/:coreid', app.oauth.authenticate(), Api.release_product_device);
        app.get('/v1/products/:productIdOrSlug/customers', app.oauth.authenticate(), Api.get_product_customers);
        
        app.post('/v1/products/:productIdOrSlug/devices', app.oauth.authenticate(), Api.add_product_device);
    },

    getSocketID: function (userID) {
        return userID + "_" + global._socket_counter++;
    },

    getUserID: function (req) {
        if (!req.app.locals.oauth) {
            logger.log("Token obj was empty");
            return false;
        }
        if(req.app.locals.oauth.token.scope && req.app.locals.oauth.token.scope.indexOf("customer=") > -1) {
        	logger.log("Customer token");
        	return false;
        }
        //req.user.id is set in authorise.validateAccessToken in the OAUTH code
        return req.app.locals.oauth.token.user;
    },
    
    getCustomerID: function (req) {
        if (!req.app.locals.oauth) {
            logger.log("Token obj was empty");
            return false;
        }
        if(!req.app.locals.oauth.token.scope || req.app.locals.oauth.token.scope.indexOf("customer=") == -1) {
        	logger.log("User token");
        	return false;
        }
        //req.user.id is set in authorise.validateAccessToken in the OAUTH code
        return req.app.locals.oauth.token.user;
    },
    
    getUserOrCustomerID: function (req) {
        if (!req.app.locals.oauth) {
            logger.log("Token obj was empty");
            return false;
        }
        //req.user.id is set in authorise.validateAccessToken in the OAUTH code
        return req.app.locals.oauth.token.user;
    },
    
    hasDevice: function (coreID, userID) {  
    	var userObj = global.roles.getUserByDevice(coreID);
        //check core permission
        if(userObj && userObj._id == userID) {
        	return true;
        } else {
        	//logger.log("device Permission Denied");
        	return false;
        }
    },
    
    hasOrg: function (userID) {  
    	var orgObj = global.roles.getOrgByUserid(userID);
        //check user permission
        if(orgObj) {
        	return true;
        } else {
        	return false;
        }
    },
    
    hasProduct: function (productIdOrSlug, userID) {
    	var orgObj = global.roles.getOrgByProductid(productIdOrSlug);
        //check user permission
        if(orgObj && orgObj.user_id == userID) {
        	return true;
        } else {
        	return false;
        }
    },

    list_devices: function (req, res, next) {
        var userid = Api.getUserOrCustomerID(req);
        if(!userid) {
        	return next();
        }
        
        logger.log("ListDevices", { userID: userid });

        //give me all the cores
		
        //var allCoreIDs = global.server.getAllCoreIDs(),
        var userDevicesIDs = global.roles.devices[userid],
            devices = [],
            connected_promises = [];
		
        for (var index in userDevicesIDs) {
        	var coreid = userDevicesIDs[index];
        	
            if (!coreid) {
                continue;
            }

            var core = global.server.getCoreAttributes(coreid);
			
            var device = {
                id: coreid,
                name: core ? core.name : null,
                last_app: core ? core.last_flashed_app_name : null,
                product_id: core ? core.spark_product_id : null,
                firmware_version: core ? core.product_firmware_version : null,
                system_version: core ? core.spark_system_version : null,
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

            res.status(200).json(devices);
        });
    },

    get_core_attributes: function (req, res, next) {
        var userid = Api.getUserOrCustomerID(req);
        if(!userid) {
        	return next();
        }
        
        var socketID = Api.getSocketID(userid),
            coreID = req.coreID,
            socket = new CoreController(socketID);
		
		if(!Api.hasDevice(coreID, userid)) {
			res.status(403).json({
			  "error": "device Permission Denied",
			  "info": "I didn't recognize that device name or ID"
			});
			return;
		}

        logger.log("GetAttr", { coreID: coreID, userID: userid.toString() });

        var objReady = parallel([
            function () {
                return when.resolve(global.server.getCoreAttributes(coreID));
            },
            function () {
                return utilities.alwaysResolve(socket.sendAndListenForDFD(coreID, { cmd: "Describe" }, { cmd: "DescribeReturn" }));
            },
            function () {
                return utilities.alwaysResolve(socket.sendAndListenForDFD(coreID, { cmd: "Ping" }, { cmd: "Pong" }));
            }
        ]);

        //whatever we get back...
        when(objReady).done(function (results) {
            try {

                if (!results || (results.length != 3)) {
                    logger.error("get_core_attributes results was the wrong length " + JSON.stringify(results));
                    res.status(404).json("Oops, I couldn't find that core");
                    return;
                }

                //we're expecting descResult to be an array: [ sender, {} ]
                var doc = results[0],
                    descResult = results[1],
                    coreState = null,
                    descPingResult = results[2];

                if (!doc || !doc.coreID) {
                    logger.error("get_core_attributes 404 error: " + JSON.stringify(doc));
                    res.status(404).json("Oops, I couldn't find that core");
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
                    product_id: doc.spark_product_id || null,
                    firmware_version: doc.product_firmware_version || null,
                    system_version: doc.spark_system_version || null,
                    //connected: !!coreState,
                    connected: (descPingResult != "Request Timed Out") ? descPingResult[1].online : false,
                    last_heard: (descPingResult != "Request Timed Out") ? descPingResult[1].lastPing : null,
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
                res.status(500).json({ Error: "get_core_attributes error: " + ex });
            }
        }, null);

        //get_core_attribs - end
    },
    
    set_core_attributes: function (req, res, next) {
        var coreID = req.coreID;
        var userid = Api.getUserID(req);
        if(!userid) {
        	return next();
        }
		
		if(!Api.hasDevice(coreID, userid) && !Api.hasOrg(userid)) {
        	res.status(403).json({
        	  "error": "device Permission Denied",
        	  "info": "I didn't recognize that device name or ID"
        	});
        	return;
        }
		        
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
        	console.log("file");
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
            tmp.reject("Device is not connected");
        }

        return tmp.promise;
    },

	get_claim_code: function (req, res, next) {
		var userid = Api.getUserID(req);
		if(!userid) {
			return next();
		}
		
		logger.log("GenerateClaimCode", { userID: userid });
		
		var userDevicesIDs = global.roles.devices[userid];
		PasswordHasher.generateSalt(function (err, code) {
			code = code.toString('base64');
			code = code.substring(0, 63);
			
			when(global.roles.addClaimCode(code, userid)).then(
				function () {
					res.json({ 
						claim_code: code, 
						device_ids: userDevicesIDs 
					});
				},
				function (err) {
				    res.json({
				    	ok: false,
				    	errors: [
					    	err
					    ]
				    });
				}
			);
		});
	}, 
	
    claim_device: function (req, res, next) {
    	var userid = Api.getUserID(req);
    	if(!userid) {
    		return next();
    	}
    	
    	var coreid = req.body.id;
    	var core = global.server.getCoreAttributes(coreid);
    	
    	if(coreid) {
    	
    		if(core.claimCode) {
	    		var userObj = global.roles.getUserByClaimCode(core.claimCode);
	    		
	    		if(user) {
			    	when(global.roles.addDevice(coreid, userObj)).then(
				    	function () {
				    		var claimInfo = {
				    			user_id : userObj._id,
				    			id: coreid,
				    			connected: false,
				    			ok: true
				    		}
				    		
				    		when(Api.isDeviceOnline(userid, coreid))
				    			.then(
				    	    		function (desc) {
				    	    			claimInfo.connected = ('rejected' !== desc.state);
				    	    			
				    	    			global.server.setCoreAttribute(coreid, "claimed", true);
				    	    			res.json(claimInfo);
				    	    		},
				    	    		function (err) {
				    	    		    res.status(404).json({
				    	    		    	ok: false,
				    	    		    	errors: [
				    			    	    	"Device is not connected"
				    			    	    ]
				    	    		    });
				    	    		}
				    	    	);
				    	},
				    	function (err) {
				    	    res.status(403).json({
				    	    	ok: false,
				    	    	errors: [
				    	        	"That belongs to someone else. To request a transfer add ?request_transfer=true to the URL."
				    	        ]
				    	    });
				    	}    
			    	);
			    } else {
			    	res.status(404).json({
			    		ok: false, 
			    		errors: [ 
			    			{}
			    		]
			    	});
			    }
		    } else {
		    	res.status(404).json({
		    		ok: false, 
		    		errors: [ 
		    			{}
		    		]
		    	});
		    }
	    } else {
	    	res.status(404).json({
	    		ok: false, 
	    		errors: [ 
	    			"data.deviceID is empty" 
	    		]
	    	});
	    }
    },
	
	release_device: function (req, res, next) {
		var coreID = req.coreID;
		var userid = Api.getUserOrCustomerID(req);
		if(!userid) {
			return next();
		}
		
		if(!Api.hasDevice(coreID, userid)) {
			res.status(403).json({
			  "error": "device Permission Denied",
			  "info": "I didn't recognize that device name or ID"
			});
			return;
		}
		
		when(global.roles.removeDevice(coreID, userid)).then(
			function () {
				global.server.setCoreAttribute(coreID, "claimed", false);
				res.json({'ok' : true });
			}, function (err) {
				res.status(403).json({
				  "error": "device Permission Denied",
				  "info": "I didn't recognize that device name or ID"
				});
			}
		);
	},
	
	//called when the core send its claim code
	linkDevice: function (coreid, claimCode, productid) {
		var userObj = global.roles.getUserByClaimCode(claimCode);
		if(userObj) {
			logger.log("Linking Device...", { coreID: coreid });
		
			if(userObj.org) { //if customer
				//check if coreid is present in product devices
				var productObj = global.roles.getProductByProductid(productid);
				var index = utilities.indexOf(productObj.devices, coreid);
				if (index > -1) {
					for (var i = 0; i < global.roles.claim_codes[userObj._id].length; i++) {
						var claimCodeObj = global.roles.claim_codes[userObj._id][i];
						//check if the claim code is valid for the product
						if (claimCodeObj.code == claimCode && claimCodeObj.product_id != productid) {
							logger.error("Claim code not valid for product", { claimCode: claimCode });
							return false;
						}
					};
				} else {
					logger.error("Device not found for product");
					return false;
				}
			} 
			
			when(global.roles.addDevice(coreid, userObj)).then(
				function () {
					global.server.setCoreAttribute(coreid, "claimed", true);
					logger.log("Device linked", { coreID: coreid });
				}, 
				function (err) {
					logger.error("Error in linking Device: "+err, { coreID: coreid });
				}
			);
		} else {
			logger.error("Claim code not valid", { claimCode: claimCode });
		}
	},
	
	safeMode: function (coreID, description) {
		        
        logger.log("Device is in SAFE MODE", {coreID: coreID});
        
		global.server.publishSpecialEvents('spark/status/safe-mode', description, coreID);
		
		//#  spark/safe-mode-updater/updating
		//{"name":"spark/safe-mode-updater/updating","data":"2","ttl":"60","published_at":"2016-01-01T14:41:0.000Z","coreid":"particle-internal"}
    },
	
    loadCore: function (req, res, next) {
        req.coreID = req.params.coreid || req.body.id;

        //load core info!
        req.coreInfo = {
            "last_app": "",
            "last_heard": new Date(),
            "connected": false,
            "deviceID": req.coreID
        };

        //if that user doesn't own that coreID, maybe they sent us a core name
        var userid = Api.getUserOrCustomerID(req);
        if(!userid) {
        	return next();
        }
        
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

    get_var: function (req, res, next) {
        var userid = Api.getUserOrCustomerID(req);
        if(!userid) {
        	return next();
        }
        
        var socketID = Api.getSocketID(userid),
            coreID = req.coreID,
            varName = req.params.var,
            format = req.params.format;
		
		if(!Api.hasDevice(coreID, userid)) {
        	res.status(403).json({
        	  "error": "device Permission Denied",
        	  "info": "I didn't recognize that device name or ID"
        	});
        	return;
        }
		        
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
                    return res.status(404).json({
                        ok: false,
                        error: msg.error
                    });
                }

                //TODO: make me look like the spec.
                msg.coreInfo = req.coreInfo;
                msg.coreInfo.connected = true;

                if (format && (format == "raw")) {
                    return res.sendStatus("" + msg.result);
                }
                else {
                    return res.json(msg);
                }
            },
            function () {
                res.status(408).json({error: "Timed out."});
            }
        ).ensure(function () {
                socket.close();
            });
    },

    fn_call: function (req, res, next) {
        var userid = Api.getUserOrCustomerID(req),
            coreID = req.coreID,
            funcName = req.params.func,
            format = req.params.format;
		
		if(!userid) {
			return next();
		}
		
		if(!Api.hasDevice(coreID, userid)) {
        	res.status(403).json({
        	  "error": "device Permission Denied",
        	  "info": "I didn't recognize that device name or ID"
        	});
        	return;
        }
        
        logger.log("FunCall", { coreID: coreID, userid: userid.toString() });

        var socketID = Api.getSocketID(userid);
        var socket = new CoreController(socketID);
        var core = socket.getCore(coreID);


        var args = req.body;
        delete args.access_token;
        logger.log("FunCall - calling core ", { coreID: coreID, userid: userid.toString() });
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
                        res.status(404).json({
                            ok: false,
                            error: "Function not found"
                        });
                    }
                    else if (msg.error != null) {
                        res.status(400).json({
                            ok: false,
                            error: msg.error
                        });
                    }
                    else {
                        if (format && (format == "raw")) {
                            res.sendStatus("" + msg.result);
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
                    res.status(500).json({
                        ok: false,
                        error: "Error while api was rendering response"
                    });
                }
            },
            function () {
                res.status(408).json({error: "Timed out."});
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
		
		if(!userid) {
			return when.reject({ error: "No userID provided" });
		}
		
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

		if(!userid) {
			return when.reject({ error: "No userID provided" });
		}
		
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
		
		if(!userid) {
			return when.reject({ error: "No userID provided" });
		}
		
        logger.log("FlashCore", {coreID: coreID, userID: userid.toString()});

        var args = req.query;
        delete args.coreid;

        if (req.files) {
        	console.log(req.files);
            args.data = fs.readFileSync(req.files.file.path);
            //args.data = fs.readFileSync(req.files.file.file);
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

     provision_core: function (req, res, next) {
        //if we're here, the user should be allowed to provision cores.

        var done = Api.provision_core_dfd(req);
        when(done).then(
            function (result) {
                res.json(result);
            },
            function (err) {
                //different status code here?
                res.status(400).json(err);
            });
    },

    provision_core_dfd: function (req) {
        var result = when.defer(),
            userid = Api.getUserID(req),
            deviceID =  req.body.deviceID,
            publicKey =  req.body.publicKey;
		
		if(!userid) {
			return when.reject({ error: "No userID provided" });
		}
		
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
    
    //List products the currently authenticated user has access to.
    list_products: function (req, res, next) {
        var userid = Api.getUserID(req);
        if(!userid) {
        	return next();
        }
        
        logger.log("ListProducts", { userID: userid }); 
        
        var orgObj = global.roles.getOrgByUserid(userid);
        if(orgObj) {
        	var productObjs = global.roles.products[orgObj.slug];
    	
    		//remove devices ??
    		res.json({ products : productObjs });
    	} else {
    		res.json({ products : [] });
    	}
    },
    
    //Retrieve details for a product.
    get_product: function( req, res, next) {
    	var userid = Api.getUserID(req);
    	if(!userid) {
    		return next();
    	}
    	
    	logger.log("GetProduct", { userID: userid }); 
    	
    	var productid = req.params.productIdOrSlug;
    	var orgObj = global.roles.getOrgByProductid(productid);
    	if(orgObj && orgObj.user_id == userid) {
    		var productObj = global.roles.getProductByProductid(productid);
    
    		res.json({ product : productObj });
    	} else {
    		res.status(404).json({ ok: false, errors: [ 'Product not found' ] });
    	}
    },
    
    //Generate a device claim code for a customer, scoped for a specific product.
    get_product_claim_code: function (req, res, next) {
    	var customerid = Api.getCustomerID(req);
    	if(!customerid) {
    		return next();
    	}
    	
    	var productid = req.params.productIdOrSlug;
    	
    	logger.log("GenerateProductClaimCode", { customerID: customerid });
    	
    	var productObj = global.roles.getProductByProductid(productid);
    	var productDevicesIDs = productObj.devices;
    	PasswordHasher.generateSalt(function (err, code) {
    		code = code.toString('base64');
    		code = code.substring(0, 63);
    		
    		when(global.roles.addProductClaimCode(code, customerid, productObj.product_id)).then(
    			function () {
    				res.json({ 
    					claim_code: code, 
    					device_ids: productDevicesIDs 
    				});
    			},
    			function (err) {
    			    res.json({
    			    	ok: false,
    			    	errors: [
    				    	err
    				    ]
    			    });
    			}
    		);
    	});
    },
	
	//Remove a device from a product and re-assign to a generic Particle product. This endpoint will unclaim the device if it is owned by a customer.
	release_product_device: function (req, res, next) {
		var coreID = req.coreID;
		var userid = Api.getUserID(req);
		if(!userid) {
			return next();
		}
		
		var productid = req.params.productIdOrSlug;
		var orgObj = global.roles.getOrgByProductid(productid);
		if(orgObj && orgObj.user_id == userid) {
			when(global.roles.removeProductDevice(coreID, productid)).then(
				function () {
					global.server.setCoreAttribute(coreID, "claimed", false);
					res.json({ ok:true });
				}, function (err) {
					res.status(400).json({
					  "code": 400,
					  "ok": false,
					  "info": "Device not found for this product"
					});
				}
			);
		} else {
			res.status(404).json({ ok: false, errors: [ 'Product not found.' ] });
		}
	},
	
	//List Customers for a product.
	get_product_customers: function( req, res, next) {
		var userid = Api.getUserID(req);
		if(!userid) {
			return next();
		}
		
		logger.log("GetProductCustomer", { userID: userid }); 
		
		var productid = req.params.productIdOrSlug;
		var productObj = global.roles.getProductByProductid(productid);
		var productDevices = productObj.devices;
		var orgObj = global.roles.getOrgByProductid(productid);
		if(orgObj && orgObj.user_id == userid) {
			var customerObjs = [];
			var devices = [];
			for (var k = 0; k < productDevices.length; k++) {
				var deviceid = productDevices[k];
				var customerObj = global.roles.getUserByDevice(deviceid);
				if(customerObj && customerObj.org) { //if customer
					customerObjs.push({
						id: customerObj._id,
						email: customerObj.email,
						devices: customerObj.devices
					});
					
					var core = global.server.getCoreAttributes(deviceid);
					
					var device = {
					    id: deviceid,
					    name: core ? core.name : null,
					    last_ip_address: core.last_ip_address,
					    product_id: core.product_id
					}; 
					
					//miss device status
					
					devices.push(device);
				}
			}
			res.json({ customers : customerObjs, devices : devices });
		} else {
			res.status(404).json({ ok: false, errors: [ 'Product not found' ] });
		}
	},
	
	add_product_device: function (req, res, next) {
		var coreID = req.body.id;
		if(!coreID) {
			res.status(400).json({ ok: false, errors: [ 'id is required.' ] });
		}
		var userid = Api.getUserID(req);
		if(!userid) {
			return next();
		}
		
		var productid = req.params.productIdOrSlug;
		logger.log("AddingProductDevice", { productID: productid });
		
		var orgObj = global.roles.getOrgByProductid(productid);
		if(orgObj && orgObj.user_id == userid) {
			when(global.roles.addProductDevice(coreID, productid)).then(
				function () {
					res.json({ ok:true });
				}, function (err) {
					res.status(400).json({
					  "code": 400,
					  "ok": false,
					  "info": "Device already present for that product"
					});
				}
			);
		} else {
			res.status(404).json({ ok: false, errors: [ 'Product not found.' ] });
		}
	},

    _: null
};

exports = module.exports = global.api = Api;
