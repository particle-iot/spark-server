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
var ursa = require('ursa');
var path = require('path');
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

//        //helper page
//        app.get('/v1/:coreid/flash', Api.file_upload_view);
//
//
//        //core functions / variables
        app.post('/v1/devices/:coreid/:func', Api.fn_call);
        app.get('/v1/devices/:coreid/:var', Api.get_var);
//
//        app.put('/v1/devices/:coreid', Api.set_core_attributes);
        app.get('/v1/devices/:coreid', Api.get_core_attributes);
//        app.delete('/v1/devices/:coreid', Api.release_device);
//
//        //doesn't need per-core permissions, allows you to claim a core that is online / near you
//        app.post('/v1/devices', Api.claim_device);

        //doesn't need per-core permissions, only shows owned cores.
        app.get('/v1/devices', Api.list_devices);
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

        var cores = global.server.getAllCores(),
            devices = [],
            connected_promises = [];

        for (var coreid in cores) {
            var core = cores[coreid];

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
                    res.json(404, "Oops, I couldn't find that core in the database");
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
        socket.send(coreID, { cmd: "Ping" });

        return tmp.promise;
    },


    claim_device: function (req, res) {
        res.json({ ok: true });
    },


    loadCore: function (req, res, next) {
        req.coreID = req.param('coreid') || req.body.id;

        //load core info from the database?
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
                if (core) {
                    return when.resolve(core);
                }
                else {
                    return when.reject();
                }
            },
            function () {
                var core = global.server.getCoreByName(req.coreID);
                if (core) {
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
                    req.coreID = core.coreID;
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


    _: null
};

exports = module.exports = Api;
