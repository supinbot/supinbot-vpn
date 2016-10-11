'use strict';

const tokenGen = require('rand-token').generate;
const moment = require('moment');
const VPNToken = require('../models/vpn-token');
const co = require('co');

class TokenStore {
	static createToken(username, duration) {
		var token = TokenStore.generate();
		return co(function*() {
			yield VPNToken.update({username: username}, {username: username, token: token, expireAt: moment().add(duration, 's').toDate()}, {upsert: true});
			return token;
		});
	}

	static getToken(token) {
		return VPNToken.findOne({token: token});
	}

	static useToken(token) {
		return VPNToken.remove({token: token});
	}

	static generate() {
		return tokenGen(64);
	}
}

module.exports = TokenStore;
