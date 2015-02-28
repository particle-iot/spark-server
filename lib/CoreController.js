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
var when = require('when');
var extend = require('xtend');
var EventEmitter = require('events').EventEmitter;

var logger = require('./logger.js');
var settings = require("../settings");
var utilities = require("./utilities.js");


var CoreController = function (socketID) {
    //this.coreID = coreID;
    this.socketID = socketID;
    EventEmitter.call(this);
};

CoreController.prototype = {
    getCore: function (coreid) {
        if (global.server) {
            return global.server.getCore(coreid);
        }
        else {
            logger.error("Spark-protocol server not running");
        }
    },


    sendAndListenFor: function (recipient, msg, filter, callback, once) {
        this.listenFor(recipient, filter, callback, once);
        this.send(recipient, msg);
    },

    sendAndListenForDFD: function (recipient, msg, filter, failDelay, connectDelay) {
        var result = when.defer();

        failDelay = failDelay || settings.coreRequestTimeout;
        var failTimer = setTimeout(function () {
            result.reject("Request Timed Out");
        }, failDelay);

        var callback = function (sender, msg) {
            clearTimeout(failTimer);
            result.resolve([sender, msg]);
        };

        this.sendAndListenFor(recipient, msg, filter, callback, true);
        return result.promise;
    },


    /**
     * send a message to a core
     * @param recipient
     * @param msg
     */
    send: function (recipient, msg) {
        var that = this;
        var core = this.getCore(recipient);
        if (!core || !core.onApiMessage) {
            logger.error("Couldn't find that core ", recipient);
            return false;
        }

        process.nextTick(function () {
            try {
                //console.log("sending message with socketID" + that.socketID);
                core.onApiMessage(that.socketID, msg);
            }
            catch (ex) {
                logger.error("error during send: " + ex);
            }
        });
        return true;
    },

    /**
     * starts listening for a message event with the given filter criteria
     * @param filter
     * @param callback
     * @param once - removes the listener after we've heard back
     */
    listenFor: function (recipient, filter, callback, once) {
        var core = this.getCore(recipient);
        if (!core || !core.on) {
            logger.error("Couldn't find that core ", recipient);
            return;
        }

        var that = this,
            handler = function (sender, msg) {
                //logger.log('heard from ' + ((sender) ? sender.toString() : '(UNKNOWN)'));

                if (!utilities.leftHasRightFilter(msg, filter)) {
                    //logger.log('filters did not match');
                    return;
                }

                if (once) {
                    core.removeListener(that.socketID, handler);
                }

                process.nextTick(function () {
                    try {
                        //logger.log('passing message to callback ', msg);
                        callback(sender, msg);
                    }
                    catch (ex) {
                        logger.error("listenFor error: " + ex, (ex) ? ex.stack : '');
                    }
                });
            };

        core.on(that.socketID, handler);
    },

    subscribe: function (isPublic, name, userid) {
        if (userid && (userid != "")) {
            name = userid + "/" + name;
        }


//        if (!sock) {
//            return false;
//        }

        //start permitting these messages through on this socket.
        global.publisher.subscribe(name, this);

        return false;
    },

    unsubscribe: function (isPublic, name, userid) {
        if (userid && (userid != "")) {
            name = userid + "/" + name;
        }

//        if (!sock) {
//            return;
//        }

        global.publisher.unsubscribe(name, this);
    },

    //isPublic, obj.name, obj.userid, obj.data, obj.ttl, obj.published_at
    sendEvent: function (isPublic, name, userid, data, ttl, published_at, coreid) {

        if (!global.publisher) {
            logger.error("Spark-protocol server not running");
            return;
        }

        try {
            global.publisher.publish(
                isPublic,
                name,
                userid,
                data,
                ttl,
                published_at,
                coreid
            );
        }
        catch (ex) {
            logger.error("sendEvent Error: " + ex);
        }

        return true;
    },

    close: function () {

    }
};

///**
// * This should be made more efficient, this is too simplistic
// * @returns {{}}
// */
//CoreController.listAllCores = function() {
//    var files = fs.readdirSync(settings.coreKeysDir);
//    var cores = [];
//
//
//
//
//
//    var corelist = files.map(function(filename) { return utilities.filenameNoExt(filename); });
//    var cores = {};
//    for(var i=0;i<corelist.length;i++) {
//        var id = corelist[i];
//        cores[id] = null;
//
//        for(var key in global.cores) {
//            var core = global.cores[key];
//            if (core.coreID == id) {
//                cores[id] = core;
//                break;
//            }
//        }
//    }
//    return cores;
//};
CoreController.prototype = extend(CoreController.prototype, EventEmitter.prototype);
module.exports = CoreController;

