'use strict';

const tokenGen = require('rand-token').generate;
const bluebird = require('bluebird');
const redis = require('redis');
const co = require('co');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

class TokenStore {
	constructor(redisUri, redisDb, tokenTtl) {
		this.redisClient = redis.createClient(redisUri, {db: redisDb});

		var self = this;
		process.on('SHUTDOWN', () => {
			if (!self.redisClient.closing) self.redisClient.close();
		});

		this.tokenTtl = tokenTtl;
	}

	createToken(commonName) {
		var self = this;
		return co(function*() {
			var token;
			do {
				token = self.generate();
			} while (yield self.getToken(token));

			yield self.redisClient.setAsync(token, commonName);
			yield self.redisClient.EXPIREAsync(token, self.tokenTtl);

			return token;
		});
	}

	getToken(token) {
		return this.redisClient.getAsync(token);
	}

	useToken(token) {
		return this.redisClient.DELAsync(token);
	}

	generate() {
		return tokenGen(64);
	}
}

module.exports = TokenStore;
