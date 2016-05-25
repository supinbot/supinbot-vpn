module.exports = function(config) {
	return config.loadConfig('vpn.json', {
		certs_path: {
			doc: 'The path to the folder where keys and certificates are saved',
			format: String,
			default: '/etc/openvpn/easy-rsa/keys/'
		},
		ca: {
			doc: 'The name of the CA file',
			format: String,
			default: 'ca.crt'
		},
		url: {
			doc: 'The URL of the front-end (with trailing /)',
			format: 'url',
			default: 'https://vpn.supinbot.ovh/'
		},
		ttl: {
			doc: 'The time in minutes for which a token is valid',
			format: 'nat',
			default: 15
		},
		port: {
			doc: 'The port on which express will listen on',
			format: 'port',
			default: 8080
		},
		profile: {
			doc: 'The ovpn profile configuration',
			format: String,
			default: 'client\n'
		},
		status_path: {
			doc: 'The location of openvpn-status.log',
			format: String,
			default: '/etc/openvpn/openvpn-status.log'
		},
		password: {
			doc: 'Password used to gain access to the monitoring page',
			format: String,
			default: null
		},
		cookie: {
			secret: {
				doc: 'String used to encrypt the cookie',
				format: String,
				default: null
			},
			duration: {
				doc: 'Duration of the cookie in ms',
				format: 'nat',
				default: 2 * 60 * 60 * 1000 // 2 hours.
			},
			active_duration: {
				doc: 'if duration < active_duration, the session will be extended by active_duration ms',
				format: 'nat',
				default: 10 * 60 * 1000 // 10 minutes.
			}
		},
		smtp: {
			host: {
				doc: 'Hostname or IP address of the SMTP server',
				format: String,
				default: '127.0.0.1'
			},
			port: {
				doc: 'The port of the SMTP server',
				format: 'port',
				default: 25
			},
			from: {
				doc: 'The from field of the email',
				format: String,
				default: '"SUPINBOT VPN" <no-reply@supinbot.ovh>'
			},
			subject: {
				doc: 'The subject field of the email',
				format: String,
				default: 'Your VPN Profile is ready!'
			},
		}
	});
};
