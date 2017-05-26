/**
 * Module dependencies.
 */

var express = require('express'),
    fs = require('fs'),
    port = process.env.PORT || 3000,
    http = require('http'),
    path = require('path'),
    Feed = require('feed'),
    flash = require("connect-flash"),
    cons = require('consolidate'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    expressCompression = require('compression'),
    sm = require('sitemap'),
    Poet = require('poet'),
    crypto = require("crypto"),
    moment = require("moment"),
    passport = require("passport"),
    swig = require("swig"),
    routes = require("./config/routes"),
    passportInit = require("./config/passport"),
    nodemailer = require("nodemailer"),
    q = require('q'),
    sendmailTransport = require('nodemailer-sendmail-transport'),
    im = require('node-imagemagick');

var env = process.env.NODE_ENV || 'development',
  config = require('./config/config')[env];

var app = express();
app.set('views', __dirname + '/app/views');
app.engine('html', cons.swig);
app.set('view engine', 'html');
// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(expressCompression());
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));


// required for passport
app.use(session({ secret: 'ilovewebdevelopmentandiamcrazyabouttechnology' })); // session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    var host = req.header('host');
    console.log('Probing URL:', req.originalUrl, host, req.secure);
    if (host === 'www.supnig.com' && !req.secure) {
        console.log('Redirecting URL:', req.originalUrl, host);
        res.redirect('https://www.supnig.com' + req.url);
    } else if (host === 'supnig.com') {
        console.log('Redirecting URL:', req.originalUrl, host);
        res.redirect('https://www.' + host + req.url);
    } else {
        next();
    }
});


passportInit(passport, config);
routes(app, passport, config);

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

var generatePostThumbnail = function(posts, key){
    var tnname, extname, basename;
    if(typeof posts[key].picture != 'undefined') {
        extname = path.extname(posts[key].picture);
        basename = posts[key].picture.replace(extname, '_thumb' + extname);
        if (!fs.existsSync(__dirname + '/public' + basename)) {
            im.resize({
                srcPath:__dirname + '/public' + posts[key].picture,
                dstPath:__dirname + '/public' + basename,
                width:360
            }, function(err, stdout, stderr){
                if (err) {
                    console.log(__dirname + '/public'+ basename, err, stdout, stderr);
                } else {
                    posts[key].thumbnail = basename;
                }
            });
        } else {
            posts[key].thumbnail = basename;
        }
    }
};

var generateSitemap = function(){
    var urls = [];
    var posts = poet.helpers.getPosts();
    for(var key in posts) {
        urls.push({
            url:           posts[key].url,
            changefreq:'monthly',
            priority:0.5
        });

        generatePostThumbnail(posts, key);

        posts[key].getThumb = function(){
            if (typeof this.thumbnail != 'undefined') {
                return this.thumbnail;
            }
            return this.picture;
        };
    }
    urls.push({
        url:           "https://www.supnig.com/about",
        changefreq:'monthly',
        priority:0.7
    });
    urls.push({
        url:           "https://www.supnig.com/blog",
        changefreq:'monthly',
        priority:0.7
    });
    sitemap = sm.createSitemap ({
        hostname: 'https://www.supnig.com',
        cacheTime: 600000,        // 600 sec - cache purge period
        urls: urls
    });
};

var generateGalleries = function() {
    var re = /<!--gallery:(.*?)-->/g,
        match,gpath,images,gallerytemplate=__dirname + '/app/views/gallery.html',
        filename, extname, basename;
    poet.clearCache();
    Object.keys(poet.posts).map(function (title) {
        var post = poet.posts[title];

        while (match = re.exec(post.content)) {
            images = [];
            gpath = __dirname + '/public/'+match[1];
            if (fs.existsSync(gpath)) {
                fs.readdirSync(gpath).forEach(function (file) {
                    if (file.indexOf('_thumb')<0) {
                        filename = "/" + match[1] + "/" + file;
                        extname = path.extname(file);
                        basename = filename.replace(extname, '_thumb' + extname);
                        if (!fs.existsSync(__dirname + '/public' + basename)) {
                            im.resize({
                                srcPath: __dirname + '/public' + filename,
                                dstPath: __dirname + '/public' + basename,
                                width: 360
                            }, function (err, stdout, stderr) {
                                if (err) {
                                    console.log(__dirname + '/public' + basename, err, stdout, stderr);
                                }
                            });
                        }
                        images.push({"filename": filename, "thumbnail": basename});
                    }
                });
                var needle = "<!--gallery:" + match[1] + "-->";


                swig.renderFile(gallerytemplate,{"images":images, "rel":post.slug},function(err,result){
                    if (err) {
                        return;
                    }
                    post.content = post.content.replace(needle, result);
                });
            }
        }

    });
};

var prettydate = function(date) {
  return moment(date).fromNow();
};

var renderIndexWithMessageCapcha = function(req, res, messagesuccess) {
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
    res.render('index', {
        "portfolios":poet.helpers.postsWithCategory("portfolio"),
        /*"worldtrip":poet.helpers.postsWithCategory("worldtrip").sort(function(a,b){
            return a.date.getTime() - b.date.getTime();
        }),*/
        "post" : poet.helpers.getPost(config.featuredpost),
        "captchaValue":captchaValue,
        "captcha":req.session.captcha,
        "name1":field1,
        "name2":field2,
        "messagesuccess":messagesuccess,
        "prettydate":prettydate,
        "title":"Christopher Supnig - Welcome to my website",
        "description":"I am writing about technology, programming and life in general."
    });
};

var sendMail = function(frommail,name,message,phone) {
    var deferred = q.defer();
    var transport = nodemailer.createTransport(sendmailTransport( {
        path: config.sendmail,
        args: ["-t", "-f", config.adminemail]
    }));
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: "Supnig Blog ["+config.adminemail+"]", // sender address
        to: config.adminemail, // list of receivers
        subject: "New Message your blog", // Subject line
        text: "New Message blog - From: "+name+" Email: "+frommail+" Phone: "+phone+"  Text: " + message + " - by "+frommail, // plaintext body
        html: "New Message blog - From: "+name+" Email: "+frommail+" Phone: "+phone+"  Text: " + message + " - by "+frommail // html body
    };

    // send mail with defined transport object
    transport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
    });
    deferred.resolve(true);
    return deferred.promise;
};

var renderPostWithComments = function(postslug, req, res,captchaerror,commenterror) {
    var post = poet.helpers.getPost(postslug);
    var relatedPosts = [], relatedCount = 3;

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
            relatedPosts = poet.helpers.getPosts().filter(function (p) {
                if (!p.tags || !post.tags || relatedCount<=0 || p.url == post.url) {
                    return false;
                }
                for (var k in post.tags) {
                    if (p.tags.indexOf(post.tags[k])>-1) {
                        relatedCount--;
                        return true;
                    }
                }
                return false;
            });
            res.render('post', { "post": post,
                                "captchaValue":captchaValue,
                                "captcha":req.session.captcha,
                                "name1":field1,
                                "name2":field2,
                                "captchaerror":captchaerror,
                                "commenterror":commenterror,
                                "prettydate":prettydate,
                                "related":relatedPosts,
                                "blogcategories":config.blogcategories,
                                "isadmin":req.user && req.user.email == config.adminemail
                                });
        } else {
            res.sendStatus(404);
        }
};
/**
 * In this example, upon initialization, we can modify the posts,
 * like format the dates using a library, or modify titles.
 * We'll add some asterisks to the titles of all posts for fun.
 */
poet.watch(function () {
    generateGalleries();
    generateSitemap();
}).init().then(function () {
    generateGalleries();
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
        renderPostWithComments(req.params.post,req,res,false, false);
    } else {
        sendMail(req.body.email, req.body.name, req.body.message, req.body.phone).then(function(){
            renderPostWithComments(req.params.post,req,res,false, false);
        });
    }
});

poet.addRoute('/tags/:tag', function (req, res) {
  var taggedPosts = poet.helpers.postsWithTag(req.params.tag);
  if (taggedPosts.length) {
    res.render('posts', {
        "posts": taggedPosts,
        "tag": req.params.tag,
        "blogcategories":config.blogcategories,
        "prettydate":prettydate
    });
  }
});

poet.addRoute('/category/:category', function (req, res) {
  var categorizedPosts = poet.helpers.postsWithCategory(req.params.category);
  if (categorizedPosts.length) {
    res.render('posts', {
        "posts": categorizedPosts,
        "category": req.params.category,

        "blogcategories":config.blogcategories,
        "prettydate":prettydate
    });
  }
});

poet.addRoute('/pages/:page', function (req, res) {
  var page = req.params.page,
      lastPost = page * 3;
  res.render('posts', {
    posts: poet.helpers.getPosts(lastPost - 3, lastPost),
      "blogcategories":config.blogcategories,
    page: page
  });
});

poet.addRoute('/overview', function (req, res) {

    res.render('overview', {
        "categories": poet.helpers.getCategories(),
        "tags": poet.helpers.getTags()
    });
});

poet.addRoute('/blog', function (req, res) {
    var posts = poet.helpers.getPosts().filter(function(post){
        return config.blogcategories.indexOf(post.category) > -1;
    });
    var first = [], rest = [], count = 0;
    posts.forEach(function(post){
        if (count > 2) {
            rest.push(post);
        } else {
            first.push(post);
        }
        count++;
    });
    res.render('posts', {
        "firstposts" : first,
        "rest":rest,
        "posts": posts,
        "tags": poet.helpers.getTags(),
        "blogcategories":config.blogcategories,
        "prettydate":prettydate
    });
});

app.get('/', function (req, res) {
    renderIndexWithMessageCapcha(req,res,false);
});

app.post('/message', function (req, res) {
    if (req.body[req.session.captcha] != req.session.capchaValue) {
        renderIndexWithMessageCapcha(req,res,false);
    } else {
        sendMail(req.body.email, req.body.name, req.body.message, req.body.phone).then(function(){
            renderIndexWithMessageCapcha(req,res,true);
        });
    }
});

app.get('/about', function (req, res) {
    res.render('about', {
        "title":"Christopher Supnig - About me",
        "description":"Find out more about Christopher Supnig."
    });
});

app.get('/amazon', function (req, res) {
    res.render('amazon');
});

app.get('/cookie', function (req, res) {
    res.render('cookie', {
        "title":"Christopher Supnig - Cookie policy",
        "description":"On this website I am using cookies to improve your experience."
    });
});

app.get('/rss', function (req, res) {
    var feed = new Feed({
        title:          'Christopher Supnig - Blog',
        description:    'This is the RSS feed to my blog!',
        link:           'https://www.supnig.com/',
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
    sitemap.toXML( function (err, xml) {
        if (err) {
            console.log('ERROR delivering sitemap', JSON.stringify(err, null, 4));
            return res.status(500).end();
        }
        res.header('Content-Type', 'application/xml');
        res.send( xml );
    });
});

app.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('404', { url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

app.listen(port);
console.log('Finished setting up server on port ' + port);
