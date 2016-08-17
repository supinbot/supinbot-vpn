'use strict';

const nodemailer = require('nodemailer');
const Promise = require('bluebird');
const util = require('util');

const config = require('../index').config;
const SupinBot = require('../index').SupinBot;

var mailer = nodemailer.createTransport({
	host: config.get('smtp.host'),
	port: config.get('smtp.port'),
	auth: {
		user: config.get('smtp.login'),
		pass: config.get('smtp.password')
	}
}, {
	from: config.get("smtp.from"),
	subject: config.get("smtp.subject"),
});

const MAIL_TEMPLATE = `Your OpenVPN account is almost ready!
First you need to choose a password. To do so, use the following link:
%s

Username: %s
Password: <Secret>

Quickly change your password as this link will only be valid for %d minutes.
Don't know how to setup OpenVPN? Don't worry, we have a link for that ;)
%s

If you have any issues, contact the administrator.`;

module.exports = (email, token, username) => {
	return new Promise((resolve, reject) => {
		var mailConfig = {
			to: email,
			text: util.format(
				MAIL_TEMPLATE,
				`${SupinBot.config.get('web.url')}vpn/password/${token}`,
				username,
				Math.round(config.get('ttl') / 60),
				`${SupinBot.config.get('web.url')}vpn/profile`
			)
		};

		mailer.sendMail(mailConfig, function(err, data) {
			if (err) return reject(err);
			resolve(data);
		});
	});
};
