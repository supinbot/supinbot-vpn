'use strict';

const valid = require('validator');
const path = require('path');
const co = require('co');

const pkg = require('./package.json');
const TokenStore = require('./lib/token-store');

module.exports = function(SupinBot) {
	var config = SupinBot.config.loadConfig(require('./lib/config.js'));
	module.exports.config = config;
	module.exports.SupinBot = SupinBot;

	var tokenStoreInstance = new TokenStore(SupinBot.config.get('redis'), config.get('redisDb'), config.get('ttl'));
	module.exports.tokenStoreInstance = tokenStoreInstance;

	const Profile = require('./lib/profile');
	const routes = require('./routes/index');
	const sendMail = require('./lib/mailer');
	const Account = require('./models/account');

	SupinBot.WebApp.registerRoute(pkg.name, '/vpn', 'VPN', routes);

	SupinBot.CommandManager.addCommand('vpnreset', function(user, channel, args, argsStr) {
		co(function*() {
			const username = args[0];

			const account = yield Account.findOne({username: username});
			if (!account) return SupinBot.postMessage(user.id, `User not found.`);

			const token = yield tokenStoreInstance.createToken(username);
			SupinBot.postMessage(user.id, `Sending password reset email to *${username}*...`);

			try {
				return yield sendMail(account.email, token, username);
			} catch (e) {
				SupinBot.log.error(`Failed to send email to ${account.email}.`);
				SupinBot.log.error(e);
			}
		}).catch((e) => {
			throw e;
		});
	})
	.setDescription('Sends a password reset email to a user.')
	.addArgument('Username', 'string')
	.ownerOnly();

	SupinBot.CommandManager.addCommand('vpncreate', function(user, channel, args, argsStr) {
		co(function*() {
			const username = args[0];
			const email = args[1];
			const active = args[2] === 1;
			const sendActivationEmail = args[3] === 1;
			var parsedEmail = '';
			var errors = [];

			if (email.match(/<mailto:.*\|.*>/)) {
				const match = email.match(/\|.*>/);
				if (match) {
					parsedEmail = match[0].slice(1, -1);
				}
			} else {
				parsedEmail = email;
			}

			if (!username || !valid.isLength(username, {min: 4, max: 30})) errors.push('The username must be betwin 4 to 30 characters');
			if (!valid.isAlphanumeric(username)) errors.push('The username must be alphanumeric');

			if (!username || !valid.isEmail(parsedEmail)) errors.push('The email provided is not valid');
			if (username && !valid.isLength(parsedEmail, {max: 254})) errors.push('The email must be less than 254 characters');

			if (errors.length > 0) {
				var errMsg = 'Thats not quite right:';
				errors.forEach((err) => {
					errMsg = errMsg + '\n- ' + err;
				});
				return SupinBot.postMessage(user.id, errMsg);
			}

			try {
				yield Account.create({
					username: username.trim(),
					email: parsedEmail.trim(),
					active: active
				});
			} catch (e) {
				if (e.code == 11000) return SupinBot.postMessage(user.id, 'Thats not quite right:\n- The username and email must be unique');
				throw e;
			}

			SupinBot.postMessage(user.id, `Account created (*${username}*).`);

			if (sendActivationEmail) {
				const token = yield tokenStoreInstance.createToken(username);

				try {
					yield sendMail(parsedEmail, token, username);
				} catch (e) {
					SupinBot.log.error(`Failed to send email to ${email}.`);
					SupinBot.log.error(e);
				}
			}
		}).catch((e) => {
			throw e;
		});
	})
	.setDescription('Creates a new OpenVPN account.')
	.addArgument('Username', 'string')
	.addArgument('Email', 'string')
	.addArgument('Active', 'bool', 'true')
	.addArgument('Send activation email', 'bool', 'true')
	.ownerOnly();

	SupinBot.CommandManager.addCommand('vpntoggle', function(user, channel, args, argsStr) {
		co(function*() {
			const username = args[0];

			const account = yield Account.findOne({username: username});
			if (!account) return SupinBot.postMessage(user.id, `Account not found.`);

			yield Account.update({username: username}, {$set: {active: !account.active}});

			const newStatus = account.active ? 'deactivated' : 'activated';
			SupinBot.postMessage(user.id, `Account *${username}* ${newStatus}.`);
		}).catch((e) => {
			throw e;
		});
	})
	.setDescription('Activates or deactivates an OpenVPN account.')
	.addArgument('Username', 'string')
	.ownerOnly();
};
