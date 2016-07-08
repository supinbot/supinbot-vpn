module.exports = function(config) {
	return config.loadConfig({
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
		url: {
			doc: 'The URL of the front-end (with trailing /)',
			format: 'url',
			default: 'https://vpn.supinbot.ovh/',
                        env: 'SUPINBOT_VPN_URL'
		},
		ttl: {
			doc: 'The time in minutes for which a token is valid',
			format: 'nat',
			default: 15,
                        env: 'SUPINBOT_VPN_TOKEN_TTL'
		},
		port: {
			doc: 'The port on which express will listen on',
			format: 'port',
			default: 8080,
                        env: 'SUPINBOT_VPN_PORT'
		},
		noCache: {
			doc: 'Disable template caching',
			format: Boolean,
			default: true,
                        env: 'SUPINBOT_VPN_DISABLE_CACHE'
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
		password: {
			doc: 'Password used to gain access to the monitoring page',
			format: String,
			default: null,
                        env: 'SUPINBOT_VPN_PASSWORD'
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
	});
};
