{{{
    "title": "Moving my blog to Node.js",
    "tags": ["JavaScript", "Node.js", "Blog"],
    "category": "technology",
    "date": "Mon, 01 Dec 2014 17:31:35 GMT",
    "color":"green",
    "slug":"moving-my-blog-to-nodejs"
}}}

Up to now my blog was running on a self made implementation of the JSR-286
standard. In this post I want to fill you in on how and why I moved to a
Node.js implementation and what obstacles I ran into.
<!--more-->
About three years ago I decided that I wanted to have a blog like all the cool
kids on the internet and being a software developer I could not just use a ready
made solution. That was when I was looking to no-sql databases an OrientDB in particular.
At that time I was doing a lot of my projects with Java portals and I also wanted to know
if I could write a fast and lightweight portal server that had only the features I needed.
And that was what I did.

After running this Java blog implementation for 3 years now I kind of got annoyed by the fact
that I had to build and redeploy stuff, when I wanted a simple new feature or a small extension
and so I decided to give implementing a blog engine another try. Having done a few projects
with Node.js and [express.js](http://expressjs.com/) I was impressed by the ease of implementation
and the quick development cycles and so I decided to write the whole thing in JavaScript.

Next to favoring the quick and easy development of projects on Node.js I even got a little bit
more lazy and decided to use a ready made blog framework for Node. I started searching and found
a few resources but all of the engines did not quite fit my requirements. I wanted to store my
blog posts as markdown files in GIT but I also needed a database connection for comments.
The framework that was most suitable for my needs turned out to be [Poet](http://jsantell.github.io/poet/).
Setting it up is very easy and it allows my to keep my posts in my GIT repository. To set up
Poet in your Node.js application, you just need to require and configure it.

    var Poet = require('poet');
    ...
    /**
     * Instantiate and hook Poet into express;
     */
    var poet = Poet(app,{
        posts: './posts/',
        metaFormat: 'json'
    });

Yes, it is just as easy as that! Thanks to [@jsantell](https://twitter.com/jsantell) at this point for this awesome work!
Unfortunately it had no functionality for comments, google sitemaps and rss but it was not very hard to extend it.
For example to set up an RSS feed, I just had to include the feed module and tell it to render my posts.

    var Feed = require('feed');
    ...
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

I found the way Poet was reading meta data out of a JSON object that has to be placed at the top of the markdown files
for your blog posts to categorise your blog and add all kinds of information like the post date, the slug, the category and tags.
And also that you could specify where you want your preview/teaser text to end by placing an HTML comment there. As I will
probably need galleries in my blog posts in the near future, I added a little snippet, that would create a gallery out of a
folder of images by also placing a little HTML comment in the blog post's text.

    <!--gallery:/images/gallery1-->

The comment references the desired folder containing the images and the following function will render a template for each of those comments when
a blog post is read by Poet.

    var generateGalleries = function() {
        var re = /<!--gallery:(.*?)-->/g,
            match,gpath,images,gallerytemplate=__dirname + '/app/views/gallery.html';
        poet.clearCache();
        Object.keys(poet.posts).map(function (title) {
            var post = poet.posts[title];

            while (match = re.exec(post.content)) {
                images = [];
                gpath = __dirname + '/public/'+match[1];
                if (fs.existsSync(gpath)) {
                    fs.readdirSync(gpath).forEach(function (file) {
                        images.push("/"+match[1]+"/"+file);
                    });
                    var needle = "<!--gallery:" + match[1] + "-->";
                    swig.renderFile(gallerytemplate,{"images":images},function(err,result){
                        if (err) {
                            return;
                        }
                        post.content = post.content.replace(needle, result);
                    });
                }
            }

        });
    };
    poet.watch(function () {
        generateGalleries();
    }).init().then(function () {
        generateGalleries();
    });

As I just put this new blog implementation together it is not perfect yet but it is moving fast into the direction I want.
You can see the full code on my [GitHub repository](https://github.com/csupnig/www.supnig.com) and if you have any suggestions
or questions, feel free to leave a comment or contact me.