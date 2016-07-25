'use strict';

const path = require('path');
const fs = require('fs-promise');
const co = require('co');

var config = require('../index').config;

class Profile {
	static generateProfile() {
		var self = this;
		return co(function*() {
			try {
				const ca = yield fs.readFile(path.resolve(config.get('ca_path')), 'utf8');
				const profileHeader = config.get('profile');

				return `${profileHeader}\n<ca>${ca}</ca>\n`;
			} catch (e) {
				return null;
			}
		});
	}
}

module.exports = Profile;
