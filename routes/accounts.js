'use strict';

const express = require('express');
const valid = require('validator');
const csrf = require('csurf');
const co = require('co');

var config = require('../index').config;
var SupinBot = require('../index').SupinBot;

const Account = require('../models/account');
const TokenStore = require('../lib/token-store');
const sendMail = require('../lib/mailer');

var router = express.Router();

var csrfMiddleware = csrf({
	sessionKey: 'vpn_sess'
});

router.get('/', csrfMiddleware, (req, res, next) => {
	co(function*() {
		const success = req.query.success === 'true';
		const accounts = yield Account.find();
		res.render('vpn/accounts/index.html', {title: 'SUPINBOT VPN - Accounts', accounts: accounts, success: success, csrfToken: req.csrfToken()});
	}).catch((e) => {
		next(e);
	});
});

router.get('/create', csrfMiddleware, (req, res, next) => {
	res.render('vpn/accounts/create.html', {title: 'SUPINBOT VPN - Add Account', fieldErrs: {}, csrfToken: req.csrfToken()});
});

router.post('/create', csrfMiddleware, (req, res, next) => {
	co(function*() {
		const username = req.body.username;
		const email = req.body.email;
		const active = req.body.active === 'on';
		const sendActivationEmail = req.body.sendMail === 'on';
		var fieldErrs = {};
		var errors = [];

		if (!username || !valid.isLength(username, {min: 4, max: 30})) {fieldErrs.username = true; errors.push('The username must be betwin 4 to 30 characters');}
		if (!valid.isAlphanumeric(username)) {fieldErrs.username = true; errors.push('The username must be alphanumeric');}

		if (!username || !valid.isEmail(email)) {fieldErrs.email = true; errors.push('The email provided is not valid');}
		if (username && !valid.isLength(email, {max: 254})) {fieldErrs.email = true; errors.push('The email must be less than 254 characters');}

		if (errors.length > 0)
			return res.render('vpn/accounts/create.html', {title: 'SUPINBOT VPN - Add Account', fieldErrs: fieldErrs, errors: errors, csrfToken: req.csrfToken()});

		try {
			yield Account.create({
				username: username.trim(),
				email: email.trim(),
				active: active
			});
		} catch (e) {
			if (e.code == 11000) {
				fieldErrs.username = true;
				fieldErrs.email = true;
				errors.push('The username and email must be unique');
				return res.render('vpn/accounts/create.html', {title: 'SUPINBOT VPN - Add Account', fieldErrs: fieldErrs, errors: errors, csrfToken: req.csrfToken()});
			}

			throw e;
		}

		res.redirect('/vpn/admin/accounts?success=true');

		if (sendActivationEmail) {
			const token = yield TokenStore.createToken(username, config.get('ttl'));

			try {
				yield sendMail(email, token, username);
			} catch (e) {
				SupinBot.log.error(`Failed to send email to ${email}.`);
				SupinBot.log.error(e);
			}
		}
	}).catch((e) => {
		next(e);
	});
});

router.post('/delete', csrfMiddleware, (req, res, next) => {
	co(function*() {
		const username = req.body.username;
		yield Account.remove({username: username});

		res.redirect('/vpn/admin/accounts?success=true');
	}).catch((e) => {
		next(e);
	});
});

router.post('/toggle', csrfMiddleware, (req, res, next) => {
	co(function*() {
		const username = req.body.username;

		const account = yield Account.findOne({username: username});
		if (!account) {
			return res.renderError(404, 'Account Not Found');
		}

		yield Account.update({username: username}, {$set: {active: !account.active}});
		res.redirect('/vpn/admin/accounts?success=true');
	}).catch((e) => {
		next(e);
	});
});

router.post('/passwdreset', csrfMiddleware, (req, res, next) => {
	co(function*() {
		const username = req.body.username;

		const account = yield Account.findOne({username: username});
		if (!account) {
			return res.renderError(404, 'Account Not Found');
		}

		const token = yield TokenStore.createToken(account.username, config.get('ttl'));
		res.redirect('/vpn/admin/accounts?success=true');

		try {
			yield sendMail(account.email, token, username);
		} catch (e) {
			SupinBot.log.error(`Failed to send email to ${account.email}.`);
			SupinBot.log.error(e);
		}
	}).catch((e) => {
		next(e);
	});
});

router.use((err, req, res, next) => {
	if (err.code !== 'EBADCSRFTOKEN') return next(err);
	res.renderError(403, 'Invalid CSRF Token');
});

module.exports = router;
