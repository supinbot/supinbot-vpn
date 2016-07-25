'use strict';

const mongoose = require('mongoose');
var db = require('../lib/db');

var Account = new mongoose.Schema({
	username: {type: String, index: true, unique: true, required: true},
	password: String,
	email: {type: String, unique: true},
	active: {type: Boolean, default: true}
});

module.exports = db.model('Account', Account);
