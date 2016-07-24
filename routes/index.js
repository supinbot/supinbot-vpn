'use strict';

const sessions = require("client-sessions");
const express = require('express');
const redis = require('redis');
const RateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const co = require('co');

var config = require('../index').config;
var SupinBot = require('../index').SupinBot;
var tokenStoreInstance = require('../index').tokenStoreInstance;

const Profile = require('../lib/profile');
const VPNStatus = require('../lib/vpn-status');
var router = express.Router();

var loginLimit = new RateLimit({
	windowMs: config.get('rate_limit.window'),
	delayMs: config.get('rate_limit.delay'),
	max: config.get('rate_limit.max'),
	store: new RedisStore({
		expiry: config.get('rate_limit.window') / 1000,
		client: redis.createClient(SupinBot.config.get('redis'), {db: config.get('rate_limit.redisDb')})
	}),
	handler: function(req, res) {
		res.renderError(429);
	}
});

router.use(sessions({
	cookieName: 'vpn_sess',
	secret: config.get('cookie.secret'),
	duration: config.get('cookie.duration'),
	activeDuration: config.get('cookie.active_duration'),
	cookie: {
		path: '/vpn'
	}
}));

router.use((req, res, next) => {
	if (req.vpn_sess.logged) {
		res.locals.logged = true;
	}

	next();
});

router.get('/', (req, res, next) => {
	res.redirect('/vpn/profile');
});

router.get('/profile/:token?', (req, res, next) => {
	const token = req.params.token;
	if (token && token.length > 70) return res.render('vpn/profile.html', {token: token || '', error: true});
	res.render('vpn/profile.html', {token: req.params.token || ''});
});

router.post('/profile/:token?', (req, res, next) => {
	co(function*() {
		const token = req.body.token;
		if (token && token.length > 70) return res.render('vpn/profile.html', {token: token || '', error: true});

		const commonName = yield tokenStoreInstance.getToken(token);
		if (!commonName) return res.render('vpn/profile.html', {token: token || '', error: true});

		var profile = new Profile(commonName);
		var profileData = yield profile.generateProfile();
		if (!profileData) {
			SupinBot.log.warn(`Cannot access ${commonName}'s certificate or key.`);
			return res.render('vpn/profile.html', {token: token || '', error: true});
		}

		res.setHeader('Content-Disposition', `attachment; filename=${commonName}.ovpn`);
		res.write(profileData);
		res.end();
	});
});

router.get('/login', (req, res, next) => {
	if (req.vpn_sess.logged) return res.redirect('/vpn/monitor');

	res.render('vpn/login.html', {title: 'SUPINBOT VPN - Login'});
});

router.post('/login', loginLimit, (req, res, next) => {
	if (req.body.password === config.get('password')) {
		req.vpn_sess.logged = true;
		res.redirect('/vpn/monitor');
	} else {
		res.render('vpn/login.html', {title: 'SUPINBOT VPN - Login', error: true});
	}
});

router.use((req, res, next) => {
	if (req.vpn_sess.logged) {
		next();
	} else {
		res.redirect('/vpn/login');
	}
});

router.get('/logout', (req, res, next) => {
	req.vpn_sess.reset();
	res.redirect('/vpn');
});

router.get('/monitor', (req, res, next) => {
	co(function*() {
		const users = yield VPNStatus.getActiveUsers();
		res.render('vpn/monitor.html', {title: 'SUPINBOT VPN - Monitor', users: users});
	});
});

module.exports = router;
