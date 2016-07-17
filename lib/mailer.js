'use strict';

const nodemailer = require('nodemailer');
const Promise = require('bluebird');
const util = require('util');

const config = require('../index').config;

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

const MAIL_TEMPLATE = `Your OpenVPN profile is now ready!
You may download it using the following link:
%s

Quickly redeem your profile as this link will only be valid for %d minutes.
If you have any issue redeeming your profile, contact the administrator.`;

module.export = (email, url) => {
	return new Promise((resolve, reject) => {
		var mailConfig = {
			to: email,
			text: util.format(MAIL_TEMPLATE, url, Math.round(config.get('ttl') / 60))
		};

		mailer.sendMail(mailConfig, function(err, data) {
			if (err) return reject(err);
			resolve(data);
		});
	});
};
