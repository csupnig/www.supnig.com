{{{
  "title": "Sitemaps",
  "tags": ["sitemap", "google", "SEO"],
  "category": "work",
  "date": "Tue, 29 May 2012 16:44:16 GMT",
  "color":"lightblue"
}}}

It is always good to have google and other search engines index your website.?People will find stuff that you write and products you are seeling event if they don't know your website up to now. There are many ways to make your site as easy to index as possible. You can use a robots.txt wo tell the crawler how to handle your website and you can add all kinds of meta tags to give it additional information about the content, the authors and many other things.
<!--more-->
Another nice way to tell the crawlers of a search engine what pages to index, is to provide a sitemap. A sitemap is a list of all pages you want the search engine to download and analyze.

A few days ago I wanted to create a sitemap for this blog so I went to google and looked at the possibilities. It pointed me to an open sitemap format ([http://www.sitemaps.org/](http://www.sitemaps.org/)) that will not only be understood by google, it can be used for many other search engines including microsoft's bing.

The protocol is very streight forward and provides you with some knobs to fine tune the indexation of your page. It is based on XML and includes the tags described on the [protocol description](http://www.sitemaps.org/protocol.html).

To be used on very large websites it provides the possibility to combine several sitemaps to a so called sitemap index. Every sitemap in the index can have independent attributes. Using those features you can create a sitemaps for all "archived" pages that will not change again and another one for all new pages. This makes indexing much faster because the search engines do not have to crawl all your pages but just the ones that are new or have changed.

You don't even have to register the sitemap with all the search engines, you can just reference it in your robots.txt like this:

    User-agent: *
    Allow: /
    Sitemap: http://www.supnig.com/sitemap


Since I did not find a nice tool to create such a sitemap in Java, I decided to quickly write one. It does not yet support the sitemap index feature but apart from that it can be used very easily:

    List posts = db.query(new OSQLSynchQuery("select * from BlogPost order by date desc"));
    
    Sitemap sitemap = new Sitemap();
    
    Item overview = new Item(new URI("http://www.supnig.com"));
    overview.setModificationFrequency(ModificationFrequency.weekly);
    sitemap.add(overview);
    
    for (BlogPost post : posts) {
        RevereURL url = response.createRenderURL();
        url.setParameter("post", post.getSanitizedTitle());
        Item i = new Item(new URI("http://www.supnig.com" + url.toString()));
        i.setLastmod(post.getDate());
        sitemap.add(i);
    }
    sitemap.render(response.getWriter());

If you want to try it out yourself or have some improvements, you can find the source on github ([https://github.com/csupnig/sitemap](https://github.com/csupnig/sitemap)).