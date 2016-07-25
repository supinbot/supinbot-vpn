'use strict';

const bluebird = require('bluebird');
const express = require('express');
const bcrypt = require('bcrypt');
const valid = require('validator');
const co = require('co');

var config = require('../index').config;
var SupinBot = require('../index').SupinBot;
var tokenStoreInstance = require('../index').tokenStoreInstance;

const Account = require('../models/account');

var router = express.Router();

const hashAsync = bluebird.promisify(bcrypt.hash);

router.get('/:token?', (req, res, next) => {
	co(function*() {
		const token = req.params.token;
		if (!token || token === '') return res.renderError(403, 'Invalid Token');

		const username = yield tokenStoreInstance.getToken(token);
		if (!username) return res.renderError(403, 'Invalid Token');

		res.render('vpn/accounts/passwd.html', {title: 'SUPINBOT VPN - Reset Password', fieldErrs: {}, errors: []});
	}).catch((e) => {
		next(e);
	});
});

router.post('/:token?', (req, res, next) => {
	co(function*() {
		const token = req.params.token;
		const password = req.body.password;
		const passwordConf = req.body.passwordConf;
		var fieldErrs = {};
		var errors = [];

		if (!token || token === '') return res.renderError(403, 'Invalid Token');
		if (!password || !valid.isLength(password, {min: 8, max: 100})) {fieldErrs.password = true; errors.push('The password must be betwin 8 to 100 characters');}
		if (password !== passwordConf) {fieldErrs.passwordConf = true; errors.push('The passwords do not match');}

		if (errors.length > 0)
			return res.render('vpn/accounts/passwd.html', {title: 'SUPINBOT VPN - Reset Password', fieldErrs: fieldErrs, errors: errors});

		const username = yield tokenStoreInstance.getToken(token);
		if (!username) return res.renderError(403, 'Invalid Token');

		const hash = yield hashAsync(password, 10);

		yield Account.update({username: username}, {$set: {password: hash}});
		yield tokenStoreInstance.useToken(token);

		res.render('vpn/accounts/passwd.html', {title: 'SUPINBOT VPN - Reset Password', fieldErrs: fieldErrs, errors: errors, success: 'Password resset successfull!'});
	}).catch((e) => {
		next(e);
	});
});

module.exports = router;
