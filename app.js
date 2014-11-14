/**
 * Module dependencies.
 */

var express = require('express'),
    fs = require('fs'),
    port     = process.env.PORT || 8080,
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    passport = require("passport"),
    flash = require("connect-flash"),
    cons = require('consolidate'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session');
    Poet = require('poet');;

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
app.set('views', __dirname + '/app/views');
app.engine('html', cons.swig);
app.set('view engine', 'html');
// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));


// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(path.join(__dirname, 'public')));
/**
 * Instantiate and hook Poet into express; no defaults defined
 */
var poet = Poet(app,{
    posts: './posts/',
    postsPerPage: config.postperpage,
    metaFormat: 'json',
    readMoreLink:function(post){
        return '';
    }
});

/**
 * In this example, upon initialization, we can modify the posts,
 * like format the dates using a library, or modify titles.
 * We'll add some asterisks to the titles of all posts for fun.
 */
poet.watch(function () {
    // watcher reloaded
}).init().then(function () {
  /*poet.clearCache();
  Object.keys(poet.posts).map(function (title) {
    var post = poet.posts[title];
    post.title = '***' + post.title;
  });*/
});

/**
 * Now we set up custom routes; based on the route (ex: '/post/:post'),
 * it'll override the default route for the same type and update
 * all appropriate helper methods
 */

poet.addRoute('/blog/:post', function (req, res) {
  var post = poet.helpers.getPost(req.params.post);
  if (post) {
    res.render('post', { post: post });
  } else {
    res.send(404);
  }
});

poet.addRoute('/tags/:tag', function (req, res) {
  var taggedPosts = poet.helpers.postsWithTag(req.params.tag);
  if (taggedPosts.length) {
    res.render('tag', {
      posts: taggedPosts,
      tag: req.params.tag
    });
  }
});

poet.addRoute('/category/:category', function (req, res) {
  var categorizedPosts = poet.helpers.postsWithCategory(req.params.category);
  if (categorizedPosts.length) {
    res.render('category', {
      posts: categorizedPosts,
      category: req.params.category
    });
  }
});

poet.addRoute('/pages/:page', function (req, res) {
  var page = req.params.page,
      lastPost = page * 3;
  res.render('index', {
    posts: poet.helpers.getPosts(lastPost - 3, lastPost),
    page: page
  });
});

app.get('/', function (req, res) {
    res.render('index', {
        posts: poet.helpers.getPosts()
    });
});

app.listen(port);
console.log('Finished setting up server on port ' + port);