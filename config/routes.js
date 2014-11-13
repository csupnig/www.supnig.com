var User = require('../app/models/User');

var version = require('../package.json').version;



module.exports = function(app, passport,config){
	

	var Auth = require('./middlewares/authorization.js')(config);

	/*
	app.get('/tickerdata/:id/:resolution', ticker.tickerdata);
	app.get('/tickerperiod/:id/:resolution/:start/:end', ticker.tickerperiod);
	app.get('/availablemarkets', ticker.availableMarkets);
	app.get('/availablemarkets/:id', ticker.availableMarkets);

	app.get('/possibleprice/:id/:bs/:amount', ticker.possiblePrice);

	app.get('/private/balance/:key/:secret', Auth.isAuthenticated , trader.getBalance);
	app.post('/private/client', Auth.isAuthenticated , trader.doClientSignedRequest);
	app.get('/private/info', Auth.isAuthenticated , trader.getMarketInfo);

	app.get('/private/trade/:key/:secret', Auth.isAuthenticated , trader.trade);
	
	app.post('/strategies/create', Auth.isAuthenticated , strategymanager.createStrategy);
	app.get('/strategies/load', strategymanager.loadStrategies);
	app.get('/strategies/get/:id', strategymanager.getStrategy);
	app.get('/strategies/upvote/:id', Auth.isAuthenticated, strategymanager.upvote);
	app.get('/strategies/downvote/:id', Auth.isAuthenticated, strategymanager.downvote);
	app.del('/strategies/delete/:id', Auth.isAdmin, strategymanager.deleteStrategy);
*/
	app.get("/", function(req, res){ 
		var d = req.session && req.session.dev ? req.session.dev : false;
		console.dir(d);
		if(req.isAuthenticated()){
		  res.render("index", { user : req.user, 'version' : version, 'dev':d}); 
		}else{
		  res.render("index", { user : null, 'version' : version, 'dev':d});
		}
	});

	app.get("/login", function(req, res){
		res.render("login",{'version' : version});
	});

	app.post("/login" 
		,passport.authenticate('local',{
			successRedirect : "/",
			failureRedirect : "/login",
		})
	);

	app.get("/signup", function (req, res) {
		res.render("signup",{'version' : version});
	});

	app.post("/signup", Auth.userExist, function (req, res, next) {
		User.signup(req.body.email, req.body.password, function(err, user){
			if(err) throw err;
			req.login(user, function(err){
				if(err) return next(err);
				return res.redirect("/");
			});
		});
	});

	app.get("/auth/facebook", passport.authenticate("facebook",{ scope : "email"}));
	app.get("/auth/facebook/callback", 
		passport.authenticate("facebook",{ failureRedirect: '/login'}),
		function(req,res){
			res.redirect('/');
		}
	);

	app.get('/auth/google',
	  passport.authenticate(
	  	'google',
		  {
		  	scope: [
		  	'https://www.googleapis.com/auth/userinfo.profile',
		  	'https://www.googleapis.com/auth/userinfo.email'
		  	]
		  })
	  );

	app.get('/auth/google/callback', 
	  passport.authenticate('google', { failureRedirect: '/login' }),
	  function(req, res) {
	    // Successful authentication, redirect home.
	    res.redirect('/');
	  });

	app.get("/userinfo/authenticated", function(req,res){
		if (req.user) {
			var userinfo = {userid:req.user._id, authenticated:true, email:req.user.email, firstName:req.user.firstName, lastName:req.user.lastName};
			if (req.user.email == config.adminemail) {
				userinfo.isadmin = true;
			}
			userinfo.dev = req.session && req.session.dev ? req.session.dev : false;
			res.json(userinfo);
		} else {
			res.json({authenticated:false});
		}
	});

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/login');
	});
}