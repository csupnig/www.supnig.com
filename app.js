/**
 * Module dependencies.
 */

var express = require('express'),
    fs = require('fs'),
    port     = process.env.PORT || 8080,
    http = require('http'),
    path = require('path'),
    Feed = require('feed'),
    mongoose = require('mongoose'),
    passport = require("passport"),
    flash = require("connect-flash"),
    cons = require('consolidate'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    sm = require('sitemap'),
    Poet = require('poet'),
    Comment = require("./app/models/Comment"),
    crypto = require("crypto"),
    moment = require("moment");

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
app.use(session({ secret: 'ilovewebdevelopmentandiamcrazyabouttechnology' })); // session secret
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


var sitemap = null;

var generateSitemap = function(){
    var urls = [];
    var posts = poet.helpers.getPosts();
    for(var key in posts) {
        urls.push({
            url:           posts[key].url,
            changefreq:'monthly',
            priority:0.5
        });
    }
    urls.push({
        url:           "http://www.supnig.com/about",
        changefreq:'monthly',
        priority:0.7
    });
    sitemap = sm.createSitemap ({
        hostname: 'http://www.supnig.com',
        cacheTime: 600000,        // 600 sec - cache purge period
        urls: urls
    });
};

var prettydate = function(date) {
  return moment(date).fromNow();
};

var renderPostWithComments = function(postslug, req, res,captchaerror,commenterror) {
    var post = poet.helpers.getPost(postslug);
    Comment.find({"post":postslug}).sort('-date').exec(function(err,comments){
        if (err) {
            console.error(err);
        }
        if (post) {
            var captchaValue = crypto.randomBytes(64).toString('hex');
            req.session.capchaValue = captchaValue;
            var field1 = crypto.randomBytes(64).toString('hex');
            var field2 = crypto.randomBytes(64).toString('hex');
            if (Math.random() > 0.5) {
                req.session.empty = field1;
                req.session.captcha = field2;
            } else {
                req.session.empty = field2;
                req.session.captcha = field1;
            }
            res.render('post', { "post": post,
                                "comments":comments,
                                "captchaValue":captchaValue,
                                "captcha":req.session.captcha,
                                "name1":field1,
                                "name2":field2,
                                "captchaerror":captchaerror,
                                "commenterror":commenterror,
                                "prettydate":prettydate
                                });
        } else {
            res.send(404);
        }
    });
};
/**
 * In this example, upon initialization, we can modify the posts,
 * like format the dates using a library, or modify titles.
 * We'll add some asterisks to the titles of all posts for fun.
 */
poet.watch(function () {
    generateSitemap();
}).init().then(function () {
    generateSitemap();
});

/**
 * Now we set up custom routes; based on the route (ex: '/post/:post'),
 * it'll override the default route for the same type and update
 * all appropriate helper methods
 */

poet.addRoute('/blog/:post', function (req, res) {
    renderPostWithComments(req.params.post,req, res,false,false);
});

app.post('/comment/:post', function (req, res) {
    if (req.body[req.session.captcha] != req.session.capchaValue) {
        renderPostWithComments(req.params.post, req, res,true,false);
    } else {
        var comment = Comment.createComment({
            name: req.body.name,
            email: req.body.email,
            comment: req.body.comment,
            post: req.params.post,
            date: new Date()
        }).then(function () {
            renderPostWithComments(req.params.post, req, res,false,false);
        }, function (err) {
            console.error("Error while saving comment for ", req.params.post, err);
            //in case of error we render the thing anyway
            renderPostWithComments(req.params.post, req, res,false,true);
        });
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
        "posts": poet.helpers.getPosts(),
        "prettydate":prettydate
    });
});

app.get('/about', function (req, res) {
    res.render('about');
});

app.get('/rss', function (req, res) {
    var feed = new Feed({
        title:          'Christopher Supnig - Blog',
        description:    'This is the RSS feed to my blog!',
        link:           'http://www.supnig.com/',
        copyright:      'Copyright © 2014 Christopher Supnig. All rights reserved',

        author: {
            name:       'Christopher Supnig',
            email:      'contact@supnig.com',
            link:       'https://www.supnig.com'
        }
    });

    var posts = poet.helpers.getPosts();

        if(typeof posts == 'undefined' || posts.length <=0)
            res.send('404 Not found', 404);
        else {
            for(var key in posts) {
                feed.addItem({
                    title:          posts[key].title,
                    link:           posts[key].url,
                    description:    posts[key].preview,
                    date:           posts[key].date
                });
            }
            // Setting the appropriate Content-Type
            res.set('Content-Type', 'text/xml');

            // Sending the feed as a response
            res.send(feed.render('rss-2.0'));
        }
});

app.get('/sitemap', function (req, res) {
    sitemap.toXML( function (xml) {
        res.header('Content-Type', 'application/xml');
        res.send( xml );
    });
});

app.listen(port);
console.log('Finished setting up server on port ' + port);