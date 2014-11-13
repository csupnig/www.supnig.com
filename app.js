/**
 * Module dependencies.
 */

var express = require('express'),
  fs = require('fs'),
  http = require('http'),
  path = require('path'),
  mongoose = require('mongoose'),
  passport = require("passport"),
  flash = require("connect-flash"),
  MongoStore = require('connect-mongo')(express),
    cons = require('consolidate');

var env = process.env.NODE_ENV || 'development',
  config = require('./config/config')[env];


mongoose.connect(config.db);

var models_dir = __dirname + '/app/models';

fs.readdirSync(models_dir).forEach(function (file) {
  if(file[0] === '.') return; 
  require(models_dir+'/'+ file);
});


require('./config/passport')(passport, config)

var app = express();

var server = http.createServer(app);

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/app/views');
  app.engine('html', cons.swig);
  app.set('view engine', 'html');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({
	    secret:'cointelligence secret cat',
	    maxAge: new Date(Date.now() + (3600000 * 24)),
	    store: new MongoStore(
	        {db:'cointelligencesessions',
	    		clear_interval: (3600000 * 24)
			},
	        function(err){
	            console.log(err || 'connect-mongodb setup ok');
	        })
	}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.methodOverride());
  app.use(express.errorHandler())
  app.use(flash());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

require('./config/routes')(app, passport,config);

app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.render('500', { error: err });
});

app.use(function(req, res, next){
  res.status(404);
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }
  res.type('txt').send('Not found');
});

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err);
    process.exit(1);
});

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});