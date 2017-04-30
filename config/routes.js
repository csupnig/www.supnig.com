var User = require('../app/models/User');
var TwitterBotDBClient = require("../app/models/TwitterBotDBClient").TwitterBotDBClient;
var version = require('../package.json').version;



module.exports = function(app, passport,config){
	

	var Auth = require('./middlewares/authorization.js')(config);

    app.get('/auth/twitter',
        passport.authenticate('twitter'));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', { failureRedirect: '/' }),
        function(req, res) {
            // Successful authentication, redirect home.
            res.redirect('/twitter');
        });

	var renderTwitter = function(req, res) {
		TwitterBotDBClient.loadUser(req.user.twitter.username).then(function(user) {
			console.log('RENDER FOR USER', JSON.stringify(user, null, 2));
            res.render('twitter', {
            	"handle": user.user,
                "source": user && user.source ? user.source.join(',') : ''
            });
		}).catch(function() {
			res.redirect('/');
		})

	};

	app.get("/twitter", Auth.isAuthenticated, function(req,res){
		if (req.user) {
            renderTwitter(req,res);
		} else {
			res.json({authenticated:false});
		}
	});

    app.post("/twitter", Auth.isAuthenticated, function(req,res){
        if (req.user) {
        	console.log('SET', req.body.source, JSON.stringify(req.body.source.split(',')));
        	TwitterBotDBClient.updateSource(req.user.twitter.username, req.body.source ? req.body.source.split(',') : []).then(function(data) {
        		renderTwitter(req, res);
			}).catch(function() {
				renderTwitter(req,res);
			});
        } else {
            res.json({authenticated:false});
        }
    });

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/login');
	});
}
