var when = require('when');
var extend = require('xtend');
var EventEmitter = require('events').EventEmitter;

var logger = require('./logger.js');
var settings = require("../settings");
var utilities = require("./utilities.js");


var CoreController = function (socketID) {
    this.socketID = socketID;
};

CoreController.prototype = {
    getCore: function (coreid) {
        if (global.cores) {
            return global.cores[coreid];
        }
        else {
            logger.error("Spark-protocol server not running");
        }
    },


    sendAndListenFor: function (recipient, msg, filter, callback, once) {
        this.listenFor(filter, callback, once);
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
        var core = this.getCore(recipient);
        if (!core) {
            logger.error("Couldn't find that core " + recipient);
            return;
        }

        process.nextTick(function () {
            try {
                core.onApiMessage(this.socketID, msg);
            }
            catch (ex) {
                logger.error("error during send: " + ex);
            }
        });
    },

    /**
     * starts listening for a message event with the given filter criteria
     * @param filter
     * @param callback
     * @param once - removes the listener after we've heard back
     */
    listenFor: function (filter, callback, once) {
        var core = this.getCore(recipient);
        if (!core) {
            logger.error("Couldn't find that core " + recipient);
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
                        //logger.log('passing message to callback');
                        callback(sender, msg);
                    }
                    catch (ex) {
                        logger.error("listenFor error: " + ex, (ex) ? ex.stack : '');
                    }
                });
            };

        core.on(that.socketID, handler);
    },


    //isPublic, obj.name, obj.userid, obj.data, obj.ttl, obj.published_at
    sendEvent: function (isPublic, name, userid, data, ttl, published_at) {

        if (!global.publisher) {
            logger.error("Spark-protocol server not running");
            return;
        }

        process.nextTick(function () {
            try {
                global.publisher.publish(
                    isPublic,
                    name,
                    userid,
                    data,
                    ttl,
                    published_at
                );
            }
            catch (ex) {
                logger.error("sendEvent Error: " + ex);
            }
        });

        return true;
    },

    close: function () {

    }
};
module.exports = CoreController;

