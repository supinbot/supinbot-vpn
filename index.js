var sessions = require("client-sessions");
var bodyparser = require('body-parser');
var nodemailer = require('nodemailer');
var nunjucks = require('nunjucks');
var express = require('express');
var crypto = require('crypto');
var x509 = require('x509.js');
var async = require('async');
var path = require('path');
var fs = require('fs');

var TOKENS = {};

module.exports = function(SupinBot) {
	var config = require('./config.js')(SupinBot.config);

	function certExists(certName, callback) {
		async.map([config.get('ca'), certName + '.crt', certName + '.key'], function(file, cb) {
			fs.access(path.resolve(config.get('certs_path'), file), fs.R_OK, function(err) {
				cb(err);
			});
		}, function(err) {
			callback(err);
		});
	}

	function useToken(token) {
		var tokenData = TOKENS[token];
		if (tokenData) {
			delete TOKENS[token];

			var diff = new Date().getTime() - tokenData.expire.getTime();
			if (diff < 0) {
				return tokenData.cert;
			}
		}
	}

	function genProfile(certName, callback) {
		async.map([config.get('ca'), certName + '.crt', certName + '.key'], function(file, cb) {
			fs.readFile(path.resolve(config.get('certs_path'), file), 'utf8', function(err, data) {
				cb(err, data.trim());
			});
		}, function(err, profileData) {
			if (!err) {
				var profile = config.get('profile') + '\n<ca>\n' + profileData[0] + '\n</ca>\n<cert>\n' + profileData[1] + '\n</cert>\n<key>\n' + profileData[2] + '\n</key>\n';
				callback(err, profile);
			} else {
				callback(err);
			}
		});
	}

	function getCertEmail(certName, callback) {
		fs.readFile(path.resolve(config.get('certs_path'), certName + '.crt'), 'utf8', function(err, data) {
			if (err) return callback(err);
			var cert = x509.parseCert(data);
			if (cert.subject.emailAddress) return callback(null, cert.subject.emailAddress);
			callback('Certificate does not contain an email address.');
		});
	}

	function formatBytes(bytes, decimals) {
		if (bytes === 0) return '0 Byte';
		var k = 1024;
		var dm = decimals + 1 || 3;
		var sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
		var i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

	function getVPNUsers(callback) {
		fs.readFile(config.get('status_path'), 'utf8', function(err, data) {
			if (!err) {
				var lines = data.split(/\n/);
				var activeUsers = [];

				for (var i = 3; i < lines.length; i++) {
					var line = lines[i];
					if (line.trim() === 'ROUTING TABLE') break;

					var items = line.split(',');

					var user = {};
					user.name = items[0];
					user.ip = items[1];
					user.received = formatBytes(Number(items[2]), 2);
					user.sent = formatBytes(Number(items[3]), 2);
					user.connection = new Date(items[4]).toLocaleString();

					activeUsers.push(user);
				}

				callback(null, activeUsers);
			} else {
				callback(err);
			}
		});
	}


	var mailer = nodemailer.createTransport({
		host: config.get('smtp.host'),
		port: config.get('smtp.port')
	});


	SupinBot.CommandManager.addCommand('vpntoken', function(user, channel, args, argsStr) {
		certExists(args[0], function(err) {
			if (!err) {
				var token = crypto.randomBytes(32).toString('hex');
				var data = {cert: args[0], expire: new Date(new Date().getTime() + config.get('ttl') * 60000)};
				TOKENS[token] = data;

				SupinBot.postMessage(user.id, 'Access Token generated for ' + args[0] + '\n ' + config.get('url') + 'profile/' + token);

				if (args[1] === 0) return;

				getCertEmail(args[0], function(err, email) {
					if (err) return SupinBot.postMessage(user.id, 'Failed to send email!\n' + String(err));

					var mailConfig = {
						from: config.get("smtp.from"),
						subject: config.get("smtp.subject"),
						to: email,
						text: 'You may now download your OpenVPN profile.\n' + config.get('url') + 'profile/' + token
					};

					mailer.sendMail(mailConfig, function(err, data) {
						if (err) SupinBot.postMessage(user.id, 'Failed to send email!\n' + String(err));
					});
				});
			} else {
				SupinBot.postMessage(user.id, 'Certificate not found!');
			}
		});
	})
	.setDescription('Generates an access token to retrieve a VPN certificate.')
	.addArgument('Certificate Name', 'string')
	.addArgument('Send Email', 'int', '0')
	.ownerOnly();


	var app = express();
	nunjucks.configure(path.resolve(__dirname, 'views'), {
		autoescape: true,
		express: app
	});

	app.use(bodyparser.urlencoded({extended: false}));
	app.use(sessions({
		cookieName: 'session',
		secret: config.get('cookie.secret'),
		duration: config.get('cookie.duration'),
		activeDuration: config.get('cookie.active_duration')
	}));

	app.use(function(req, res, next) {
		if (req.session.logged) {
			res.locals.logged = true;
		}

		next();
	});

	app.get('/', function(req, res, next) {
		res.redirect('/profile');
	});

	app.get('/profile/:token?', function(req, res, next) {
		if (req.params.token && req.params.token.length > 70) return res.sendStatus(500);
		res.render('profile.html', {token: req.params.token || ''});
	});

	app.post('/profile/:token?', function(req, res, next) {
		if (req.body.token && req.body.token.length > 70) return res.sendStatus(500);
		var cert = useToken(req.body.token);

		if (cert) {
			genProfile(cert, function(err, profile) {
				if (!err) {
					res.setHeader('Content-Disposition', 'attachment; filename=' + cert + '.ovpn');
					res.write(profile);
					res.end();
				} else {
					res.sendStatus(404);
				}
			});
		} else {
			res.render('profile.html', {token: req.body.token || '', error: true});
		}
	});

	app.get('/login', function(req, res, next) {
		if (req.session.logged) return res.redirect('/monitor');

		res.render('login.html', {title: 'SUPINBOT VPN - Login'});
	});

	app.post('/login', function(req, res, next) {
		if (req.body.password === config.get('password')) {
			req.session.logged = true;
			res.redirect('/monitor');
		} else {
			res.render('login.html', {title: 'SUPINBOT VPN - Login', error: true});
		}
	});

	app.use(function(req, res, next) {
		if (req.session.logged) {
			next();
		} else {
			res.redirect('/login');
		}
	});

	app.get('/logout', function(req, res, next) {
		req.session.reset();
		res.redirect('/');
	});

	app.get('/monitor', function(req, res, next) {
		getVPNUsers(function(err, users) {
			if (err) return res.sendStatus(500);

			res.render('monitor.html', {title: 'SUPINBOT VPN - Monitor', token: req.params.token || '', users: users});
		});
	});

	app.listen(config.get('port'));
};
