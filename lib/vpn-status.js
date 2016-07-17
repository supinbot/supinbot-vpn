'use strict';

const fs = require('fs-promise');
const co = require('co');

var config = require('../index').config;

class VPNStatus {
	static getActiveUsers() {
		var self = this;
		return co(function*() {
			try {
				const data = yield fs.readFile(config.get('status_path'), 'utf8');
				const lines = data.split(/\n/);
				var activeUsers = [];

				for (var i = 3; i < lines.length; i++) {
					const line = lines[i];
					if (line.trim() === 'ROUTING TABLE') break;

					const items = line.split(',');

					var user = {};
					user.name = items[0];
					user.ip = items[1];
					user.received = self.formatBytes(Number(items[2]), 2);
					user.sent = self.formatBytes(Number(items[3]), 2);
					user.connection = new Date(items[4]).toLocaleString();

					activeUsers.push(user);
				}

				return activeUsers;
			} catch (e) {
				return [];
			}
		});
	}

	static formatBytes(bytes, decimals) {
		if (bytes === 0) return '0 Byte';
		var k = 1024;
		var dm = decimals + 1 || 3;
		var sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
		var i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}
}

module.exports = VPNStatus;
