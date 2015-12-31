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
			doc: 'The URL of the front-end',
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
		}
	});
};
