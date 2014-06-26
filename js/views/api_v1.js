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
//        app.post('/v1/devices/:coreid/:func', Api.fn_call);
//        app.get('/v1/devices/:coreid/:var', Api.get_var);
//
//        app.put('/v1/devices/:coreid', Api.set_core_attributes);
//        app.get('/v1/devices/:coreid', Api.get_core_attributes);
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
                return Database.getUserCore(userid, req.coreID);
            },
            function () {
                return Database.getUserCoreByName(userid, req.coreID);
            }
        ]);

        when(gotCore).then(
            function (docs) {
                if (docs && (docs.length > 0)) {
                    var core = docs[0];
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


    _: null
};

exports = module.exports = Api;
