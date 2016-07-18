'use strict';

const x509 = require('x509.js');
const path = require('path');
const co = require('co');
const fs = require('fs');

const pkg = require('./package.json');
const TokenStore = require('./lib/token-store');
const Profile = require('./lib/profile');

module.exports = function(SupinBot) {
	var config = SupinBot.config.loadConfig(require('./lib/config.js'));
	module.exports.config = config;
	module.exports.SupinBot = SupinBot;

	var tokenStoreInstance = new TokenStore(SupinBot.config.get('redis'), config.get('redisDb'), config.get('ttl'));
	module.exports.tokenStoreInstance = tokenStoreInstance;

	const routes = require('./routes/index');
	const sendMail = require('./lib/mailer');

	SupinBot.WebApp.registerRoute(pkg.name, '/vpn', 'VPN', routes);

	SupinBot.CommandManager.addCommand('vpntoken', function(user, channel, args, argsStr) {
		co(function*() {
			const commonName = args[0];
			const sendMail = args[1];

			var profile = new Profile(commonName);

			if (yield profile.exists()) {
				const token = tokenStoreInstance.createToken(commonName);
				const url = `${SupinBot.config.get('web.url')}vpn/profile/${token}`;

				SupinBot.postMessage(user.id, `Access Token generated for ${commonName}\n${url}`);

				if (sendMail) {
					const email = yield profile.getEmail();

					if (email) {
						try {
							return yield sendMail(email, url);
						} catch (e) {
							SupinBot.log.error(e);
						}
					}

					SupinBot.log.warn(`Failed to get ${commonName}'s email.`);
					SupinBot.postMessage(user.id, 'Failed to send email!');
				}
			} else {
				SupinBot.postMessage(user.id, 'Certificate not found!');
			}
		});
	})
	.setDescription('Generates an access token to retrieve a VPN certificate.')
	.addArgument('Certificate Name', 'string')
	.addArgument('Send Email', 'int', '0')
	.ownerOnly();
};
