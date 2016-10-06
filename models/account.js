'use strict';

const mongoose = require('mongoose');
const moment = require('moment');
var db = require('../lib/db');

var Account = new mongoose.Schema({
	username: {type: String, index: true, unique: true, required: true},
	password: String,
	email: {type: String, unique: true},
	lastConnection: {type: Date},
	active: {type: Boolean, default: true}
});

Account.virtual('formattedLastConnection').get(function() {
	return this.lastConnection ? moment(this.lastConnection).format('ddd MMM D YYYY H:mm:ss ([GMT]Z)') : 'Never';
});

module.exports = db.model('Account', Account);
