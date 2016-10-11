'use strict';

const mongoose = require('mongoose');
var db = require('../lib/db');

var VPNToken = new mongoose.Schema({
	username: {type: String, index: true, unique: true, required: true},
	token: {type: String, index: true, unique: true, required: true},
	expireAt: {type: Date, required: true, expires: 0}
});

module.exports = db.model('VPNToken', VPNToken);
