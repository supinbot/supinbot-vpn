'use strict';

const sessions = require("client-sessions");
const express = require('express');
const co = require('co');

var config = require('../index').config;
var SupinBot = require('../index').SupinBot;
var tokenStoreInstance = require('../index').tokenStoreInstance;

const Profile = require('../lib/profile');
var router = express.Router();

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

router.get('/profile', (req, res, next) => {
	res.render('vpn/profile.html');
});

router.post('/profile', (req, res, next) => {
	co(function*() {
		var profileData = yield Profile.generateProfile();
		if (!profileData) {
			SupinBot.log.error(`Cannot access CA.`);
			return res.renderError(500);
		}

		res.setHeader('Content-Disposition', `attachment; filename=SUPINBOT.ovpn`);
		res.write(profileData);
		res.end();
	}).catch((e) => {
		next(e);
	});
});

router.use('/admin', require('./admin'));
router.use('/password', require('./password'));
router.use('/api', require('./api'));

module.exports = router;
