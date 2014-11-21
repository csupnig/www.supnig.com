# Building my blog on node.js

This will soon be my personal blog. I use Poet (http://jsantell.github.io/poet/)[http://jsantell.github.io/poet/] as a post engine
and I extended the functionality a bit.

## Additional features

### Comments
You can add/save/view comments on posts. The comments will be saved in a mongo DB.

### Galleries
You can place galleries in articles by adding a comment pointing to a folder in the public area containing images:
e.g.

    <!--gallery:media/pictures/gallery2-->

This will render the gallery.html in the views folder with an array of the images/files in the folder as local "images".

### RSS

I added a rss implementation that can be accessed via /rss.

### Google Sitemap

I added a google sitemap implementation that can be accessed via /sitemap

## License

The source code for the app is available under the MIT license, which is found in license.txt in the root
of this repository.