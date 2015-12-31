var bodyparser = require('body-parser');
var express = require('express');
var crypto = require('crypto');
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


	SupinBot.CommandManager.addCommand('vpntoken', function(user, channel, args, argsStr) {
		certExists(args[0], function(err) {
			if (!err) {
				var token = crypto.randomBytes(32).toString('hex');
				var data = {cert: args[0], expire: new Date(new Date().getTime() + config.get('ttl') * 60000)};
				TOKENS[token] = data;

				SupinBot.postMessage(user.id, 'Access Token generated for ' + args[0] + '\n ' + config.get('url') + token);
			} else {
				SupinBot.postMessage(user.id, 'Certificate not found!');
			}
		});
	})
	.setDescription('Generates an access token to retrieve a VPN certificate.')
	.addArgument('Certificate Name', 'string')
	.ownerOnly();


	var app = express();
	app.set('engine', 'ejs');
	app.set('views', path.resolve(__dirname, 'views'));
	app.use(bodyparser.urlencoded({extended: false}));

	app.get('/:token?', function(req, res, next) {
		if (req.params.token && req.params.token.length > 70) return res.sendStatus(500);
		res.render('index.ejs', {token: req.params.token});
	});

	app.post('/:token?', function(req, res, next) {
		if ((req.params.token && req.params.token.length > 70) || (req.body.token && req.body.token.length > 70)) return res.sendStatus(500);
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
			res.render('index.ejs', {token: req.body.token, error: true});
		}
	});

	app.listen(config.get('port'));
};
