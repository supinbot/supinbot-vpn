'use strict';

const express = require('express');
const co = require('co');

var config = require('../index').config;
var SupinBot = require('../index').SupinBot;
var tokenStoreInstance = require('../index').tokenStoreInstance;

const passport = require('../lib/passport');
const VPNStatus = require('../lib/vpn-status');
const Account = require('../models/account');

var router = express.Router();

router.get('/', (req, res, next) => {
	res.redirect('/vpn/admin/status');
});

router.get('/login', (req, res, next) => {
	if (req.vpn_sess.logged) return res.redirect('/vpn/admin');

	passport.authenticate('slack')(req, res, next);
});

router.get('/login/verify', (req, res, next) => {
	passport.authenticate('slack', (err, user) => {
		if (err) return res.renderError(err.statusCode || 500);
		req.vpn_sess.logged = true;
		res.redirect('/vpn/admin');
	})(req, res, next);
});

router.use((req, res, next) => {
	if (req.vpn_sess.logged) {
		next();
	} else {
		res.redirect('/vpn/admin/login');
	}
});

router.get('/logout', (req, res, next) => {
	req.vpn_sess.reset();
	res.redirect('/vpn');
});

router.get('/status', (req, res, next) => {
	co(function*() {
		const users = yield VPNStatus.getActiveUsers();
		res.render('vpn/status.html', {title: 'SUPINBOT VPN - Status', users: users});
	}).catch((e) => {
		next(e);
	});
});

router.use('/accounts', require('./accounts'));

module.exports = router;
