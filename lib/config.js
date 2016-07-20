'use strict';

module.exports = {
	certs_path: {
		doc: 'The path to the folder where keys and certificates are saved',
		format: String,
		default: '/etc/openvpn/easy-rsa/keys/',
		env: 'SUPINBOT_VPN_KEYS_PATH'
	},
	ca: {
		doc: 'The name of the CA file',
		format: String,
		default: 'ca.crt',
		env: 'SUPINBOT_VPN_CA_NAME'
	},
	ttl: {
		doc: 'The time in seconds for which a token is valid',
		format: 'nat',
		default: 900,
		env: 'SUPINBOT_VPN_TOKEN_TTL'
	},
	profile: {
		doc: 'The ovpn profile configuration',
		format: String,
		default: 'client\n',
		env: 'SUPINBOT_VPN_PROFILE'
	},
	status_path: {
		doc: 'The location of openvpn-status.log',
		format: String,
		default: '/etc/openvpn/openvpn-status.log',
		env: 'SUPINBOT_VPN_STATUS_PATH'
	},
	rate_limit: {
		max: {
			doc: 'Maximum amount of login requests',
			format: 'nat',
			default: 15,
			env: 'SUPINBOT_VPN_RATE_MAX'
		},
		window: {
			doc: 'Time frame in ms',
			format: 'nat',
			default: 15 * 60 * 1000,
			env: 'SUPINBOT_VPN_RATE_WINDOW'
		},
		delay: {
			doc: 'Delay for subsequent requests in ms',
			format: 'nat',
			default: 0,
			env: 'SUPINBOT_VPN_RATE_DELAY'
		},
		redisDb: {
			doc: 'The ID of the redis DB to use for rate limiting',
			format: 'nat',
			default: 7,
			env: 'SUPINBOT_VPN_RATE_REDIS_DB'
		}
	},
	password: {
		doc: 'Password used to gain access to the monitoring page',
		format: String,
		default: null,
		env: 'SUPINBOT_VPN_PASSWORD'
	},
	redisDb: {
		doc: 'The ID of the redis DB to use',
		format: 'nat',
		default: 6,
		env: 'SUPINBOT_VPN_REDIS_DB'
	},
	cookie: {
		secret: {
			doc: 'String used to encrypt the cookie',
			format: String,
			default: null,
			env: 'SUPINBOT_VPN_COOKIE_SECRET'
		},
		duration: {
			doc: 'Duration of the cookie in ms',
			format: 'nat',
			default: 2 * 60 * 60 * 1000, // 2 hours.
			env: 'SUPINBOT_VPN_COOKIE_DURATION'
		},
		active_duration: {
			doc: 'if duration < active_duration, the session will be extended by active_duration ms',
			format: 'nat',
			default: 10 * 60 * 1000, // 10 minutes.
			env: 'SUPINBOT_VPN_COOKIE_ACTIVE_DURATION'
		}
	},
	smtp: {
		host: {
			doc: 'Hostname or IP address of the SMTP server',
			format: String,
			default: '127.0.0.1',
			env: 'SUPINBOT_VPN_SMTP_HOST'
		},
		port: {
			doc: 'The port of the SMTP server',
			format: 'port',
			default: 25,
			env: 'SUPINBOT_VPN_SMTP_PORT'
		},
		login: {
			doc: 'Login of the SMTP server',
			format: '*',
			default: null,
			env: 'SUPINBOT_VPN_SMTP_LOGIN'
		},
		password: {
			doc: 'Password of the SMTP server',
			format: '*',
			default: null,
			env: 'SUPINBOT_VPN_SMTP_PASSWORD'
		},
		from: {
			doc: 'The from field of the email',
			format: String,
			default: '"SUPINBOT VPN" <no-reply@supinbot.ovh>',
			env: 'SUPINBOT_VPN_SMTP_FROM'
		},
		subject: {
			doc: 'The subject field of the email',
			format: String,
			default: 'Your VPN Profile is ready!',
			env: 'SUPINBOT_VPN_SMTP_SUBJECT'
		},
	}
};
