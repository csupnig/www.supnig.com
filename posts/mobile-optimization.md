{{{
  "title": "Mobile optimization",
  "tags": ["mobile", "CSS", "responsive"],
  "category":"tech",
  "date": "Thu, 10 May 2012 20:21:19 GMT",
  "color":"blue"
}}}

In this short post I'll talk about the process of optimizing my blog for mobile devices. I will point out some pitfalls that have to be considered and I will show solutions to some common problems.
<!--more-->
I don't have to tell you that many people use their mobile devices to browse the internet and you might also be well aware that it is very important leave a good impression no matter if your users using a smart phone or their favorite desktop browser.

Luckily the layout of my blog is very simple and therefore it worked quite well on mobile devices. I just noticed a few things that had to be improved. The thing that was bothering me most, was that my android device refused to show the page in a proper scale. Everything seemed to be so tiny and was unreadable until I zoomed in. 

There is a meta attribute viewport that is supported by many mobile browsers. You can use it to tell the browser how big the viewport is and how the initial scale should be. But beware: This meta attribute is not yet a standard.

    <meta name="viewport" content="width=device-width, initial-scale=1">

**Size:**
You can either set the size of the viewport to a specific number of pixels (_width=600_ / _height=600_) or you can set it to the _device-width_ / _device-height_.

**Scale:**
You can set the _initial-scale_, the _minimum-scale_ and the _maximum-scale_ of the viewport. The _initial-scale_ property controls the zoom when the page is loaded. The _minimum-scale_ and the _maximum-scale_ control how the users will be able to zoom the page in and out.

Thanks to [@mactuxinger](http://twitter.com/#!/mactuxinger) who just pointed out to me that maximum-scale is a big NO-NO and should not be used because it reduces accessibility!

Another thing that bothered me was, that the comment boxes where huge on mobile devices and did not fit the content area. I used media queries to make them smaller if the page is viewed on a small screen.

    @media screen and (max-width: 600px) {
        #newcomment div h4 { position: relative; }
        #newcomment div input { margin-left: 0px; width: 100%; }
        #newcomment textarea { width: 100%; }
        #newcomment div.button input { width: 100%; }
        body { font-size: 90%; }
    }

The third and last thing that I changed for now is that I had problems with long words. They were not properly wrapped and sometimes pushed out of the screen. I used the following little CSS trick to tell the browser to wrap them.

    body {
        word-wrap: break-word;
        -moz-hyphens: auto;
        -ms-hyphens: auto;
        -webkit-hyphens: auto;
        hyphens: auto;
    }

If you have any other suggestions or find some more things that should be changed on mobile devices, please let me know in the comments below!
