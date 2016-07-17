'use strict';

const path = require('path');
const x509 = require('x509.js');
const fs = require('fs-promise');
const co = require('co');

var config = require('../index').config;

class Profile {
	constructor(commonName) {
		this.commonName = commonName;
	}

	exists() {
		var self = this;
		return co(function*() {
			try {
				yield [
					fs.access(path.resolve(config.get('certs_path'), `${self.commonName}.crt`), fs.R_OK),
					fs.access(path.resolve(config.get('certs_path'), `${self.commonName}.key`), fs.R_OK),
					fs.access(path.resolve(config.get('certs_path'), config.get('ca')), fs.R_OK)
				];

				return true;
			} catch (e) {
				return false;
			}
		});
	}

	generateProfile() {
		var self = this;
		return co(function*() {
			try {
				const result = yield [
					fs.readFile(path.resolve(config.get('certs_path'), `${self.commonName}.crt`), 'utf8'),
					fs.readFile(path.resolve(config.get('certs_path'), `${self.commonName}.key`), 'utf8'),
					fs.readFile(path.resolve(config.get('certs_path'), config.get('ca')), 'utf8')
				];

				const profileHeader = config.get('profile');
				return `${profileHeader}\n<ca>${result[2]}</ca>\n<cert>${result[0]}</cert>\n<key>${result[1]}</key>\n`;
			} catch (e) {
				return null;
			}
		});
	}

	getEmail() {
		var self = this;
		return co(function*() {
			try {
				const cert = yield fs.readFile(path.resolve(config.get('certs_path'), `${self.commonName}.crt`));
				const parsedCert = x509.parseCert(cert);

				return parsedCert.subject.emailAddress;
			} catch (e) {
				return null;
			}
		});
	}
}

module.exports = Profile;
