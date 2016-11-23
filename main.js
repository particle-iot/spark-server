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
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var settings = require('./settings.js');
var utilities = require("./lib/utilities.js");
var logger = require('./lib/logger.js');

//var OAuthServer = require('node-oauth2-server');
var oauthserver = require('express-oauth-server');

var OAuth2ServerModel = require('./lib/OAuth2ServerModel');
var AccessTokenViews = require('./lib/AccessTokenViews.js');
var CustomerViews = require('./lib/CustomerViews.js');

global._socket_counter = 1;

var set_cors_headers = function (req, res, next) {
    if ('OPTIONS' === req.method) {
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
            'Access-Control-Max-Age': 300
        });
        return res.sendStatus(204);
    }
    else {
        res.set({'Access-Control-Allow-Origin': '*'});
        next();
    }
};

//TODO: something better here
process.on('uncaughtException', function (ex) {
    var details = '';
    try { details = JSON.stringify(ex); }  catch (ex2) { }

    logger.error('Caught exception: ' + ex + details);
});


var app = express();

app.oauth = new oauthserver({
  model: new OAuth2ServerModel({}),
  allowBearerTokensInQueryString:true,
  accessTokenLifetime: 7776000    //90 days
});

app.set('json spaces', 2);
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(set_cors_headers);

app.post('/oauth/token', app.oauth.token());

//app.use(app.oauth.token());
app.all('/v1/devices*', app.oauth.authenticate());
app.all('/v1/provisioning*', app.oauth.authenticate());
app.all('/v1/events*', app.oauth.authenticate());
//app.all('/v1/products', app.oauth.authenticate()); //TODO remove customer creation
//app.use(oauth.handler());
//app.use(oauth.errorHandler());

var UserCreator = require('./lib/UserCreator.js');
app.post('/v1/users', UserCreator.getMiddleware());

var api = require('./views/api_v1.js');
var eventsV1 = require('./views/EventViews001.js');
var tokenViews = new AccessTokenViews({  });
var customerViews = new CustomerViews({  });


eventsV1.loadViews(app);
api.loadViews(app);
tokenViews.loadViews(app);
customerViews.loadViews(app);


app.use(function (req, res, next) {
	res.status(404).send({ ok: false, error: "Not Found" });
});


var node_port = process.env.NODE_PORT || '9000';
node_port = parseInt(node_port);

console.log("Starting server, listening on " + node_port);
http.createServer(app).listen(node_port);


var DeviceServer = require("spark-protocol").DeviceServer;
var server = new DeviceServer({
    coreKeysDir: settings.coreKeysDir
});
global.server = server;
server.start();


var ips = utilities.getIPAddresses();
for(var i=0;i<ips.length;i++) {
    console.log("Your server IP address is: " + ips[i]);
}

