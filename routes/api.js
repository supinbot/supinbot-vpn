'use strict';

const bluebird = require('bluebird');
const express = require('express');
const bcrypt = require('bcrypt');
const co = require('co');

var config = require('../index').config;
var SupinBot = require('../index').SupinBot;

const Account = require('../models/account');

var router = express.Router();

const compareAsync = bluebird.promisify(bcrypt.compare);

router.post('/checkAccount', (req, res, next) => {
	co(function*() {
		const username = req.body.username;
		const password = req.body.password;

		if (!username || username === '') return res.status(401).json({ok: false, error: 'Invalid username'});
		if (!password || password === '') return res.status(401).json({ok: false, error: 'Invalid password'});

		const account = yield Account.findOne({username: username});

		if (!account) return res.status(401).json({ok: false, error: 'Unknown account'});
		if (!account.active || !account.password) return res.status(401).json({ok: false, error: 'Account deactivated'});

		if (yield compareAsync(password, account.password)) return res.status(202).json({ok: true});

		res.status(401).json({ok: false, error: 'Invalid credentials'});
	}).catch((e) => {
		next(e);
	});
});

module.exports = router;
