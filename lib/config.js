'use strict';

module.exports = {
	ca_path: {
		doc: 'The name of the CA file',
		format: String,
		default: '/etc/openvpn/easy-rsa/keys/ca.crt',
		env: 'SUPINBOT_VPN_CA_NAME'
	},
	ttl: {
		doc: 'The time in seconds for which a token is valid',
		format: 'nat',
		default: 3600,
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
	mongodb: {
		doc: 'The connection URI for the mongo database',
		format: String,
		default: 'mongodb://mongo:27017/supinbot_vpn',
		env: 'SUPINBOT_VPN_MONGO_URI'
	},
	api_key: {
		doc: 'The private key to authenticate the authcheck script',
		format: String,
		default: 'PRIVATE_KEY',
		env: 'SUPINBOT_VPN_API_KEY'
	},
	slack: {
		client_id: {
			doc: 'The Slack App OAUTH2 Client ID',
			format: String,
			default: null,
			env: 'SUPINBOT_VPN_SLACK_ID'
		},
		client_secret: {
			doc: 'The Slack App OAUTH2 Client Secret',
			format: String,
			default: null,
			env: 'SUPINBOT_VPN_SLACK_SECRET'
		},
		callback_url: {
			doc: 'The Slack App OAUTH2 Callback URL',
			format: String,
			default: 'http://localhost:8080/vpn/admin/login/verify',
			env: 'SUPINBOT_VPN_SLACK_CALLBACK_URL'
		}
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
			default: 'Your VPN Profile is almost ready!',
			env: 'SUPINBOT_VPN_SMTP_SUBJECT'
		},
	}
};
