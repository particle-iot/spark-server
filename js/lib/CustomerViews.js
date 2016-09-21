/**
*    Created by durielz
*/

var fs = require('fs');
var path = require('path');
var when = require('when');
var sequence = require('when/sequence');
var pipeline = require('when/pipeline');
var PasswordHasher = require('./PasswordHasher.js');
var roles = require('./RolesController.js');
var logger = require('./logger.js');

var CustomerViews = function (options) {
    this.options = options;
};

CustomerViews.prototype = {
    loadViews: function (app) {
        app.post('/v1/products/:productIdOrSlug/customers', this.createCustomer.bind(this));
    },
    
    createCustomer: function (req, res, next) {
        var credentials = CustomerViews.prototype.basicAuth(req);
        if (!credentials) {
            return res.status(401).json({
                ok: false,
                errors: ["Unauthorized. You must send client_id and client_secret in HTTP Basic Auth to view your access tokens."]
            });
        }
        
        var product = req.params.productIdOrSlug;
        
        var email = req.body.email;
        if(!email){
        	return res.status(400).json({
        		ok: false,
        		errors: ["Email is required"]
        	});
        }
		
        when(roles.validateClient(credentials.clientId, credentials.clientSecret))
            .then(
            function (clientObj) {
            	when(roles.createCustomer(clientObj, product, email)) 
            	.then(
            		function () {
            			res.json({ok: true});
            		},
            		function (err) {
            		    res.status(400).json({ ok: false, errors: [ err ] });
            		}
            	);
            },
            function (err) {
                res.status(401).json({ ok: false, errors: [ err ] });
            });
    },
    
    basicAuth: function (req) {
        var auth = req.get('Authorization');
        if (!auth) return null;

        var matches = auth.match(/Basic\s+(\S+)/);
        if (!matches) return null;

        var creds = new Buffer(matches[1], 'base64').toString();
        var separatorIndex = creds.indexOf(':');
        if (-1 === separatorIndex)
            return null;

        return {
            clientId: creds.slice(0, separatorIndex),
            clientSecret: creds.slice(separatorIndex + 1)
        };
    }

};

module.exports = CustomerViews;
