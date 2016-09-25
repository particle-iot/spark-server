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
var path = require('path');
var when = require('when');
var sequence = require('when/sequence');
var pipeline = require('when/pipeline');
var PasswordHasher = require('./PasswordHasher.js');
var roles = require('./RolesController.js');
var settings = require('../settings.js');
var logger = require('./logger.js');
var utilities = require("./utilities.js");

function RolesController() {
    this.init();
};

RolesController.prototype = {
    users: null,
    usersByToken: null,
    usersByDevice: null,
    usersByClaimCode: null,
    usersByUsername: null,
    
    access_tokens: null,
    refresh_tokens: null,
    claim_codes: null,
    
	devices: null,
	clients: null,
	
	orgsBySlug: null,
	orgsByUserId: null,

	customers: null,
	customersByEmail: null,
	//customersByToken: null,
	
	orgsByProduct: null,
	products : null,

    init: function () {
        this._loadAndCacheUsers();
    },

    addUser: function (userObj) {
        this.users.push(userObj);
        this.usersByUsername[ userObj.username ] = userObj;

        for (var i = 0; i < userObj.access_tokens.length; i++) {
            var token = userObj.access_tokens[i];
            this.usersByToken[token.token] = userObj;
            this.access_tokens[token.token] = token;
            this.refresh_tokens[token.refresh_token] = token;
        }
        
        //claim codes
        this.claim_codes[userObj._id] = userObj.claim_codes;
        for (var i = 0; i < userObj.claim_codes.length; i++) {
            var claimCode = userObj.claim_codes[i];
            this.usersByClaimCode[claimCode] = userObj;
        }
        
        //devices claimed
        this.devices[userObj._id] = userObj.devices;
        for (var i = 0; i < userObj.devices.length; i++) {
            var deviceId = userObj.devices[i];
            this.usersByDevice[ deviceId ] = userObj;
        }
    },
    addCustomer: function (customerObj) {
    	
    	console.log("Loading customer " + customerObj.email);
    	
    	this.customers.push(customerObj);
        this.customersByEmail[ customerObj.email ] = customerObj;
    
        for (var k = 0; k < customerObj.access_tokens.length; k++) {
            var token = customerObj.access_tokens[k];
            this.usersByToken[token.token] = customerObj;
            this.access_tokens[token.token] = token;
            this.refresh_tokens[token.refresh_token] = token;
        }
        
        //claim codes
        this.claim_codes[customerObj._id] = customerObj.claim_codes;
        for (var i = 0; i < customerObj.claim_codes.length; i++) {
            var claimCode = customerObj.claim_codes[i];
            this.usersByClaimCode[claimCode.code] = customerObj;
        }
        
        //devices claimed
        this.devices[customerObj._id] = customerObj.devices;
        for (var i = 0; i < customerObj.devices.length; i++) {
            var deviceId = customerObj.devices[i];
            this.usersByDevice[ deviceId ] = customerObj;
        }
    },
    addClient: function (clientObj) {
    	this.clients.push(clientObj);
    },
    addOrg: function (orgObj) {
        this.orgsBySlug[orgObj.slug] = orgObj;
        this.orgsByUserId[orgObj.user_id] = orgObj;
        
        for (var i = 0; i < orgObj.customers.length; i++) {
        	this.addCustomer(orgObj.customers[i]); //add customer
        }
        
        this.products[orgObj.slug] = []; //list product
        for (var j = 0; j < orgObj.products.length; j++) {
        	this.products[orgObj.slug].push(orgObj.products[j]);
        	this.orgsByProduct[ orgObj.products[j].slug ] = orgObj;
        	this.orgsByProduct[ orgObj.products[j].product_id ] = orgObj;
        }
    },
    destroyAccessToken: function (access_token) {
        var userObj = this.usersByToken[access_token];
        if (!userObj) {
            return true;
        }
        
        delete this.usersByToken[access_token];
        delete this.access_tokens[access_token];
        
        for (var i = 0; i < userObj.access_tokens.length; i++) {
            var tokenObj = userObj.access_tokens[i];
            if (tokenObj.token == access_token) {
                userObj.access_tokens.splice(i, 1);
            }
        }

        this.saveUser(userObj);
    },
    revokeToken: function (token) {
    	var userObj = this.usersByToken[token.accessToken];
    	if (!userObj) {
    	    return false;
    	}
    	var tokenObj = this.access_tokens[token.accessToken];
    	if(!tokenObj) {
    		return false;
    	}
    	
    	delete this.usersByToken[token.accessToken];
        delete this.access_tokens[token.accessToken];
        delete this.refresh_tokens[token.refreshToken];
        
        for (var i = 0; i < userObj.access_tokens.length; i++) {
            var tokenObj = userObj.access_tokens[i];
            if (tokenObj.token == token.accessToken) {
                userObj.access_tokens.splice(i, 1);
            }
        }
		if(tokenObj.scope && tokenObj.scope.indexOf("customer=") > -1) {
			this.saveCustomer(userObj);
		} else {
        	this.saveUser(userObj);
        }
        return token;
    },
    addAccessToken: function (token, client, user) {
    	var tmp = when.defer();
        try {
        	var tokenObj = {
        	    //user_id: user._id,
        	    token: token.accessToken,
        	    expires_at: token.accessTokenExpiresAt,
        	    client: client.client_id, 
        	    refresh_token: token.refreshToken,
        	    scope: token.scope
        	};
        	
        	if(token.scope && token.scope.indexOf("customer=") > -1) {
        	    //is a customer token
        	    var email = token.scope.split("=")[1];
        	    var customerObj = this.customersByEmail[email];
        	    
        	    this.usersByToken[token.accessToken] = customerObj;
        	    this.access_tokens[token.accessToken] = tokenObj;
        	    this.refresh_tokens[token.refreshToken] = tokenObj;
        	    customerObj.access_tokens.push(tokenObj);
        	    this.saveCustomer(customerObj);
        	    
        	    tmp.resolve({ 
        	    	accessToken: token.accessToken, 
        	    	client: client,
        	    	refreshToken: token.refreshToken,
        	    	user: customerObj._id,
        	    	scope: token.scope,
        	    	accessTokenExpiresAt: token.accessTokenExpiresAt
        	    });
        	    
        	} else {
	            var userObj = this.getUserByUserid(user._id);
	            if(!userObj) {
	            	//refresh_token
	            	userObj = this.getUserByUserid(user);
	            }
	            this.usersByToken[token.accessToken] = userObj;
	
	            this.access_tokens[token.accessToken] = tokenObj;
	            this.refresh_tokens[token.refreshToken] = tokenObj;
	            userObj.access_tokens.push(tokenObj);
	            this.saveUser(userObj);
	            
	            tmp.resolve({ 
	            	accessToken: token.accessToken, 
	            	client: client, 
	            	user: userObj._id, 
	            	refreshToken: token.refreshToken,
	            	scope: token.scope,
	            	accessTokenExpiresAt: token.accessTokenExpiresAt
	            });
            }
        }
        catch (ex) {
            logger.error("Error adding access token ", ex);
            tmp.reject(ex);
        }
        return tmp.promise;
    },
    addClaimCode: function (claimCode, userId) {
        var tmp = when.defer();
        try {
            var userObj = this.getUserByUserid(userId);
            
            userObj.claim_codes.push(claimCode);
            this.saveUser(userObj);
            
            this.usersByClaimCode[ claimCode ] = userObj;
            
            tmp.resolve();
        }
        catch (ex) {
            logger.error("Error adding claim code ", ex);
            tmp.reject(ex);
        }
        return tmp.promise;
    },
    addProductClaimCode: function (claimCode, customerId, productId) {
        var tmp = when.defer();
        try {
            var claimCodeObj = {
            	code : claimCode,
            	product_id : productId
            }
            
            var customerObj = this.getCustomerByCustomerid(customerId);
            customerObj.claim_codes.push(claimCodeObj);
            this.saveCustomer(customerObj);
            
            this.usersByClaimCode[ claimCode ] = customerObj;
            
            tmp.resolve();
        }
        catch (ex) {
            logger.error("Error adding claim code ", ex);
            tmp.reject(ex);
        }
        return tmp.promise;
    },
	addDevice: function (deviceId, userObj) {
        var tmp = when.defer();
        try {
			if(!this.usersByDevice[deviceId]) {
				userObj.devices.push(deviceId);
				if(userObj.org) { //customer
					this.saveCustomer(userObj);
				} else {
					this.saveUser(userObj);
				}
				this.usersByDevice[ deviceId ] = userObj;
				
				tmp.resolve();
			} else if(this.usersByDevice[deviceId] == userObj) {
				tmp.resolve();
			} else {
				tmp.reject("already claimed");
			}
        }
        catch (ex) {
            logger.error("Error adding device ", ex);
            tmp.reject(ex);
        }
        return tmp.promise;
    },
	removeDevice: function (deviceId, userId) {
		var tmp = when.defer();
		try {
	        var userObj = this.getUserByUserid(userId);
			
			if(this.usersByDevice[deviceId]) {
		        var index = utilities.indexOf(userObj.devices, deviceId);
		        if (index > -1) {
		            userObj.devices.splice(index, 1);
		        }
		        
		        delete this.usersByDevice[deviceId];
		
		        this.saveUser(userObj);
				tmp.resolve();
			} else {
				tmp.reject('Device not found');
			}
		}
		catch (ex) {
		    logger.error("Error releasing device ", ex);
		    tmp.reject(ex);
		}
		return tmp.promise;
    }, 
    removeProductDevice: function (deviceId, productid) {
    	var tmp = when.defer();
    	try {
            var productObj = this.getProductByProductid(productid);
            var index = utilities.indexOf(productObj.devices, deviceId);
        	if (index > -1) {
        	    productObj.devices.splice(index, 1);
        	    this.saveProduct(productObj);
        	    
        	    delete this.usersByDevice[deviceId];
        	    
        	    var orgObj = this.getOrgByProduct(productObj.product_id);
        	    for (var i = 0; i < orgObj.customers.length; i++) {
        	    	var index = utilities.indexOf(orgObj.customers[i].devices, deviceId);
        	    	if (index > -1) {
        	    	    orgObj.customers[i].devices.splice(index, 1);
        	    	    this.saveCustomer(orgObj.customers[i]);
        	    	}
        	    }
        	    
        	    tmp.resolve();
        	} else {
        		tmp.reject('Device not found for product');
        	}
    	}
    	catch (ex) {
    	    logger.error("Error releasing device ", ex);
    	    tmp.reject(ex);
    	}
    	return tmp.promise;
    },
    saveUser: function (userObj) {
        var userFile = path.join(settings.userDataDir, userObj.username) + ".json";
        var userJson = JSON.stringify(userObj, null, 2);
        fs.writeFileSync(userFile, userJson);
    },
	saveCustomer: function (customerObj) {
	    var orgObj = this.orgsBySlug[customerObj.org];
	    var orgFile = path.join(settings.orgDataDir, orgObj.slug) + ".json";
	    var index = 0;
	    for (var i = 0; i < orgObj.customers.length; i++) {
	        var customer = orgObj.customers[i];
	        if (customer._id == customerObj._id) {
	            orgObj.customers[i] = customerObj;
	        }
	    }
	    var orgJson = JSON.stringify(orgObj, null, 2);
	    fs.writeFileSync(orgFile, orgJson);
	},
	saveProduct: function (productObj) {
		var orgObj = this.orgsByProduct[productObj.slug];
	    var orgFile = path.join(settings.orgDataDir, orgObj.slug) + ".json";
	    var index = 0;
	    for (var i = 0; i < orgObj.products.length; i++) {
	        var product = orgObj.products[i];
	        if (product.id == productObj.id) {
	            orgObj.products[i] = productObj;
	        }
	    }
	    var orgJson = JSON.stringify(orgObj, null, 2);
	    fs.writeFileSync(orgFile, orgJson);
	},
	
    _loadAndCacheUsers: function () {
        this.users = [];
        this.usersByToken = {};
        this.usersByDevice = {};
        this.usersByUsername = {};
        this.usersByClaimCode = {};
        
        this.access_tokens = {};
        this.refresh_tokens = {};
        this.claim_codes = {};
        
		this.devices = [];
		this.clients = [];
		this.orgsBySlug = {};
		this.orgsByUserId = {};
		
		this.customers = [];
		this.customersByEmail = {};
		//this.customersByToken = {};
		
		this.orgsByProduct = {};
		this.products = {};
		
        // list files, load all user objects, index by access_tokens and usernames
		// and devices
        if (!fs.existsSync(settings.userDataDir)) {
            fs.mkdirSync(settings.userDataDir);
        }
        
        var files = fs.readdirSync(settings.userDataDir);
        if (!files || (files.length == 0)) {
            logger.error([ "-------", "No users exist, you should create some users!", "-------", ].join("\n"));
        }

        for (var i = 0; i < files.length; i++) {
            try {

                var filename = path.join(settings.userDataDir, files[i]);
                var userObj = JSON.parse(fs.readFileSync(filename));

                console.log("Loading user " + userObj.username);
                this.addUser(userObj);
            }
            catch (ex) {
                logger.error("RolesController - error loading user at " + filename);
            }
        }
        
        var filenameClient = settings.oauthClientsFile;
        var clients = JSON.parse(fs.readFileSync(filenameClient));
        for (var j = 0; j < clients.length; j++) {
            try {
            	console.log("Loading client " + clients[j].client_id);
            	this.addClient(clients[j]);
            }
            catch (ex) {
                logger.error("RolesController - error loading client at " + filenameOrg);
            }
        }
        
        var filesOrg = fs.readdirSync(settings.orgDataDir);
        
        for (var k = 0; k < filesOrg.length; k++) {
            try {

                var filenameOrg = path.join(settings.orgDataDir, filesOrg[k]);
                var orgObj = JSON.parse(fs.readFileSync(filenameOrg));

                console.log("Loading org " + orgObj.slug);
                this.addOrg(orgObj);
            }
            catch (ex) {
                logger.error("RolesController - error loading org at " + filenameOrg);
            }
        }
    },
    
	getClient: function ( clientId, clientSecret) {
		var clientObj = this.getClientByClientid(clientId);
		if (clientObj.client_secret == clientSecret || clientId == 'particle') {
			return clientObj;
		}
		return false;
	},
	
	getUserByClient: function ( clientId ) {
		return this.getUserByUserid(this.orgsBySlug[clientId].user_id);
	},

    getUserByToken: function (access_token) {
        return this.usersByToken[access_token];
    },
	getUserByDevice: function (deviceId) {
	    return this.usersByDevice[deviceId];
	},
	getUserByClaimCode: function (claimCode) {
	    return this.usersByClaimCode[claimCode];
	},
	getOrgByProduct: function (product) { //ok
	    return this.orgsByProduct[product];
	},
	getOrgByUserid: function (user_id) { //ok 
	    return this.orgsByUserId[user_id];
	},
	getCustomerByEmail: function (email) {
	    return this.customersByEmail[email];
	},
	
    getUserByName: function (username) {
        return this.usersByUsername[username];
    },
    getTokenInfoByAccessToken: function (token) {
    	var tokenObj = this.access_tokens[token];
    	if(!tokenObj) {
    		return false;
    	}
        return {
        	accessToken: tokenObj.token, 
        	client: tokenObj.client, 
        	user: this.getUserByToken(tokenObj.token)._id, 
        	refreshToken: tokenObj.refresh_token,
        	accessTokenExpiresAt: new Date(tokenObj.expires_at),
        	scope: tokenObj.scope
        };
    },
    getTokenInfoByRefreshToken: function (token) {
        var tokenObj = this.refresh_tokens[token];
        if(!tokenObj) {
        	return false;
        }
        return {
        	accessToken: tokenObj.token, 
        	client: tokenObj.client, 
        	user: this.getUserByToken(tokenObj.token)._id, 
        	refreshToken: tokenObj.refresh_token,
        	refreshTokenExpiresAt: new Date(tokenObj.expires_at),
        	//refreshTokenExpiresAt not managed return accessTokenExpires
        	scope: tokenObj.scope
        };
    },
    getUserByUserid: function (userid) {
        for (var i = 0; i < this.users.length; i++) {
            var user = this.users[i];
            if (user._id == userid) {
                return user;
            }
        }
        return null;
    },
    
    getProductByProductid: function (productid) {
    	var orgObj = this.orgsByProduct[productid];
        for (var i = 0; i < this.products[orgObj.slug].length; i++) {
            var product = this.products[orgObj.slug][i];
            if (product.id == productid || product.slug == productid) {
                return product;
            }
        }
        return null;
    },
    
    getCustomerByCustomerid: function (customerid) {
        for (var i = 0; i < this.customers.length; i++) {
            var customer = this.customers[i];
            if (customer._id == customerid) {
                return customer;
            }
        }
        return null;
    },
    
    getClientByClientid: function (clientId) {
    	for (var i = 0; i < this.clients.length; i++) {
    		var client = this.clients[i];
    		if (client.client_id == clientId) {
    			return client;
    		}
    	}
    	return null;
    },

    validateHashPromise: function (user, password) {
        var tmp = when.defer();

        PasswordHasher.hash(password, user.salt, function (err, hash) {
            if (err) {
                logger.error("hash error " + err);
                tmp.reject("Bad password");
            }
            else if (hash === user.password_hash) {
                tmp.resolve(user);
            }
            else {
                tmp.reject("Bad password");
            }
        });

        return tmp.promise;
    },

    validateLogin: function (username, password) {
        var userObj = this.getUserByName(username);
        if (!userObj) {
            return when.reject("Bad password");
        }

        return this.validateHashPromise(userObj, password);
    },
    
    validateClient: function (clientId, clientSecret) {
    	var tmp = when.defer();
    	
        var clientObj = this.getClient(clientId, clientSecret);
        if (!clientObj) {
            return tmp.reject("Bad client");
        }
		
		tmp.resolve(clientObj);
		
        return tmp.promise;
    },

    createUser: function (username, password) {
        var tmp = when.defer();
        var that = this;

        PasswordHasher.generateSalt(function (err, userid) {
            userid = userid.toString('base64');
            userid = userid.substring(0, 32);

            PasswordHasher.generateSalt(function (err, salt) {
                salt = salt.toString('base64');
                PasswordHasher.hash(password, salt, function (err, hash) {
                    var user = {
                        _id: userid,
                        username: username,
                        password_hash: hash,
                        salt: salt,
                        access_tokens: [],
                        claim_codes: [],
                        devices: []
                    };

                    var userFile = path.join(settings.userDataDir, username + ".json");
                    fs.writeFileSync(userFile, JSON.stringify(user));

                    that.addUser(user);

                    tmp.resolve();
                });
            });
        });

        return tmp.promise;
    },
    
    createCustomer: function (clientObj, product, email) {
        var tmp = when.defer();
        var that = this;
	
		var orgObj = that.getOrgByProduct(product);
		if(orgObj && orgObj.slug == clientObj.client_id) {
			var customer = that.getCustomerByEmail(email);
			if(!customer) {
						
		        PasswordHasher.generateSalt(function (err, customerid) {
		            customerid = customerid.toString('base64');
		            customerid = customerid.substring(0, 32);
					
		            var customer = {
		                _id: customerid,
		                email: email,
		                org: orgObj.slug,
		                access_tokens: [],
		                claim_codes: [],
		                devices: []
		            };
		            
		            var orgFile = path.join(settings.orgDataDir, orgObj.slug) + ".json";
		            orgObj.customers.push(customer);
		
		            var orgJson = JSON.stringify(orgObj, null, 2);
		            fs.writeFileSync(orgFile, orgJson);
		
		            that.addCustomer(customer);
					
		            tmp.resolve();
		        });
			} else {	
				tmp.reject('Customer '+email+' already exists');
			}
		} else {
			tmp.reject('Bad product');
		}
		
        return tmp.promise;
    }
};
module.exports = global.roles = new RolesController();