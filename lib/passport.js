'use strict';

const passport = require('passport');
const SlackStrategy = require('passport-slack').Strategy;

var config = require('../index').config;
var SupinBot = require('../index').SupinBot;

passport.use(new SlackStrategy({
	clientID: config.get('slack.client_id'),
	clientSecret: config.get('slack.client_secret'),
	callbackURL: config.get('slack.callback_url'),
	scope: 'identify',
	extendedUserProfile: false
},
(accessToken, refreshToken, profile, done) => {
	if (!profile.id) {
		var malformedErr = new Error('Unauthorized');
		malformedErr.statusCode = 401;
		return done(malformedErr);
	}

	SupinBot.WebClient.users.info(profile.id, (err, data) => {
		if (err) {
			SupinBot.log.warn(err);
			var slackErr = new Error(`Slack API Error: ${err}`);
			slackErr.statusCode = 500;
			return done(slackErr);
		}

		if (data.user.is_owner) return done(null, data.user);

		var deniedErr = new Error('Unauthorized');
		deniedErr.statusCode = 401;
		done(deniedErr);
	});
}));

module.exports = passport;
