var TwitterStrategy = require('passport-twitter').Strategy,
	User = require('../app/models/User');


module.exports = function (passport, config) {

	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(user, done) {
		done(null, user);
	});

    passport.use(new TwitterStrategy({
            consumerKey: config.twitter.consumerKey,
            consumerSecret: config.twitter.consumerSecret,
            callbackURL: config.twitter.callbackURL
        },
        function(token, tokenSecret, profile, cb) {
            User.findOrCreate({ twitter: profile, token : token, secret : tokenSecret }, function (err, user) {
                return cb(err, user);
            });
        }
    ));
};
