/**
 * Module dependencies.
 */

var fs = require('fs'),
    express = require('express');
    path = require('path'),
    sm = require('sitemap'),
    Poet = require('poet'),
    crypto = require("crypto"),
    moment = require("moment"),
    swig = require("swig"),
    nodemailer = require("nodemailer"),
    q = require('q'),
    sendmailTransport = require('nodemailer-sendmail-transport'),
    im = require('node-imagemagick'),
    _ = require('lodash'),
        gutil = require('gulp-util');

var app = express();

var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

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

poet.addRoute('/blog/:post', function (req, res) {
    renderPostWithComments(req.params.post,req, res,false,false);
});

var generatePostThumbnail = function(posts, key){
    var tnname, extname, basename;
    if(typeof posts[key].picture != 'undefined') {
        extname = path.extname(posts[key].picture);
        basename = posts[key].picture.replace(extname, '_thumb' + extname);
        if (!fs.existsSync(__dirname + '/dist' + basename)) {
            im.resize({
                srcPath:__dirname + '/dist' + posts[key].picture,
                dstPath:__dirname + '/dist' + basename,
                width:360
            }, function(err, stdout, stderr){
                if (err) {
                    console.log(__dirname + '/dist'+ basename, err, stdout, stderr);
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
        url:           "https://www.supnig.com/cv",
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
    var template = swig.compileFile(__dirname + '/app/views/gallery.html');
    Object.keys(poet.posts).map(function (title) {
        var post = poet.posts[title];

        while (match = re.exec(post.content)) {
            images = [];
            gpath = __dirname + '/dist/'+match[1];
            if (fs.existsSync(gpath)) {
                fs.readdirSync(gpath).forEach(function (file) {
                    if (file.indexOf('_thumb')<0) {
                        filename = "/" + match[1] + "/" + file;
                        extname = path.extname(file);
                        basename = filename.replace(extname, '_thumb' + extname);
                        if (!fs.existsSync(__dirname + '/dist' + basename)) {
                            im.resize({
                                srcPath: __dirname + '/dist' + filename,
                                dstPath: __dirname + '/dist' + basename,
                                width: 360
                            }, function (err, stdout, stderr) {
                                if (err) {
                                    console.log(__dirname + '/dist' + basename, err, stdout, stderr);
                                }
                            });
                        }
                        images.push({"filename": filename, "thumbnail": basename});
                    }
                });
                var needle = "<!--gallery:" + match[1] + "-->";
                var output = template({"images":images, "rel":post.slug});
                post.content = post.content.replace(needle, output);
            }
        }

    });
};

var generateYoutubeVideos = function() {
    var re = /<!--youtube:(.*?)-->/g,
        match;
    poet.clearCache();
    var template = swig.compileFile(__dirname + '/app/views/youtube.html');
    Object.keys(poet.posts).map(function (title) {
        var post = poet.posts[title];

        while (match = re.exec(post.content)) {

            var needle = "<!--youtube:" + match[1] + "-->";
            var output = template({"videoid":match[1], "rel":post.slug});
            post.content = post.content.replace(needle, output);

        }

    });
};

var prettydate = function(date) {
  return moment(date).format('DD.MM.YYYY - HH:mm');
};

var renderIndex = function(files) {
    var template = swig.compileFile(__dirname + '/app/views/index.html');
    var output = template({
        "portfolios":poet.helpers.postsWithCategory("portfolio"),
        "post" : poet.helpers.getPost(config.featuredpost),
        "prettydate":prettydate,
        "title":"Christopher Supnig - Welcome to my website",
        "description":"I am writing about technology, programming and life in general."
    });
    files.push(new gutil.File({
        cwd: "",
        base: "",
        path: "index.html",
        contents: new Buffer(output)
    }));
};

var renderPost = function(list, post) {
    var relatedPosts = [], relatedCount = 3;

    if (post) {
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
        var template = swig.compileFile(__dirname + '/app/views/post.html');
        var output = template({ "post": post,
            "prettydate":prettydate,
            "related":relatedPosts,
            "blogcategories":config.blogcategories
        });
        /*list.push(new gutil.File({
            cwd: "",
            base: "",
            path: "post/"+post.slug + "/index.html",
            contents: new Buffer(output)
        }));*/
        list.push(new gutil.File({
            cwd: "",
            base: "",
            path: "blog/"+post.slug + "/index.html",
            contents: new Buffer(output)
        }));
    }
};

function renderSitemap(list) {
    var xml = sitemap.toXML();
    list.push(new gutil.File({
        cwd: "",
        base: "",
        path: "sitemap.xml",
        contents: new Buffer(xml)
    }));

}

function renderSimple(list, file, data) {
    var template = swig.compileFile(__dirname + '/app/views/'+file+'.html');
    var output = template(data);
    list.push(new gutil.File({
        cwd: "",
        base: "",
        path: file + "/index.html",
        contents: new Buffer(output)
    }));
}

function renderBlogCategory(list, category) {

        var categorizedPosts = poet.helpers.postsWithCategory(category);
        if (categorizedPosts.length) {
            var template = swig.compileFile(__dirname + '/app/views/posts.html');
            var output = template({
                "posts": categorizedPosts,
                "category": category,

                "blogcategories":config.blogcategories,
                "prettydate":prettydate
            });
            list.push(new gutil.File({
                cwd: "",
                base: "",
                path: "category/"+category+"/index.html",
                contents: new Buffer(output)
            }));
        }
}

function renderBlogOverview(list) {
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
    var template = swig.compileFile(__dirname + '/app/views/posts.html');
    var output = template({
        "firstposts" : first,
        "rest":rest,
        "posts": posts,
        "tags": poet.helpers.getTags(),
        "blogcategories":config.blogcategories,
        "prettydate":prettydate
    });
    list.push(new gutil.File({
        cwd: "",
        base: "",
        path: "blog/index.html",
        contents: new Buffer(output)
    }));
}

function pageSource() {
    var src = require('stream').Readable({ objectMode: true });

    /**
     * In this example, upon initialization, we can modify the posts,
     * like format the dates using a library, or modify titles.
     * We'll add some asterisks to the titles of all posts for fun.
     */
    var renderPromise = poet.init().then(function () {
        generateGalleries();
        generateSitemap();
        generateYoutubeVideos();
    }).then(function() {
        var files = [];

        renderIndex(files);
        renderSitemap(files);
        renderSimple(files, 'about', {
            "title":"Christopher Supnig - About me",
            "description":"Find out more about Christopher Supnig."
        });
        renderSimple(files, 'cv', {
            "title":"Christopher Supnig - About me",
            "description":"Find out more about Christopher Supnig."
        });
        renderSimple(files, 'cookie', {
            "title":"Christopher Supnig - Cookie policy",
            "description":"On this website I am using cookies to improve your experience."
        });
        renderBlogOverview(files);
        config.blogcategories.forEach(function(cat){
            renderBlogCategory(files, cat);
        });
        renderSimple(files, '404', {});
        poet.helpers.getPosts().forEach(function(post) {
            renderPost(files, post);
        });
        return files;
    });


    src._read = function () {
        var that = this;
        renderPromise.then(function(list) {
            list.forEach(function(value) {
                that.push(value);
            });
            that.push(null);
        }, function() {
            that.push(null);
        });

    };
    return src;
}

module.exports = pageSource;
