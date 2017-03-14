const pg = require('pg');
var bcrypt = require('bcrypt');
const paths = require('./paths.js');
const conString = paths.conString();

exports.loginAuth = function(username,password){
return false;    
};
exports.dashAuth = function(deviceId,password){
    return false;
};
