/**
 * User model
 * define a user in the system:
 * 
 * username - the username
 * hash + salt - used to authenticate password sent by a user (validPassword method)
 * 
 * TODO - implement permission per user
 */

var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    // possible implementations of permission for user
    // permission: String,
    username: { type: String, lowercase: true, unique: true },
    hash: String,
    salt: String
});

UserSchema.methods.setPassword = function(password) {
    // set password method: creates salt and hash values
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    // validate password method
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
    // set expiration to 60 days
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jwt.sign({
        _id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
    }, 'SECRET');
};

mongoose.model('User', UserSchema);