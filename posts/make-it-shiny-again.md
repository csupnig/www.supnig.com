{{{
  "title": "Make it shiny again!",
  "tags": ["aloha", "technology", "html"],
  "category":"tech",
  "date": "Thu, 14 Feb 2013 22:54:58 GMT",
  "color":"pink"
}}}

Do you know the situation when you?re forced to work with a piece of HTML so "pretty" that it just makes you want to turn around and walk away from your PC? You're staring at the screen thinking of ways of how to clear up the mess but all you come with requires either a team of tamed monkeys or loosing your saninity?

In the next few lines I will show you a nice little trick that will make your mouth water, a way how to polish the old code using Aloha Editor and jQuery.
<!--more-->
Do you know
the situation when you're forced to work with a piece of HTML so "pretty" that
it just makes you want to turn around and walk away from your PC? You're
staring at the screen thinking of ways of how to clear up the mess but all you
come with requires either a team of tamed monkeys or loosing your saninity?

In the next few lines I will show you a nice
little trick that will make your mouth water, a way how to polish the old code
using Aloha Editor and jQuery.

There are a
few different kinds of HTML code that we do not like. 

### The invalid one

What it looks like:

    <div id=test>Aloha <span id='test2'>World!</span>
    <ul>
    <li>list1
    <li>list2
    </ul>
    </div>


I am
talking about code that probably works in many browsers but simply is not valid
HTML.

What we want is this:
    
    <div id="test">Aloha <span id="test2">World!</span>
    <ul>
    <li>list1</li>
    <li>list2</li>
    </ul>
    </div>


### The pasting madness

What it looks like:
    
    <h2><span lang=EN-US>My Heading</span></h2>
    <p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt'><span
    lang=EN-US style='font-family:Symbol'>?<span style='font:7.0pt "Times New Roman"'>        
    </span></span><span lang=EN-US>List 1</span></p>
    <p class=MsoListParagraphCxSpMiddle style='text-indent:-18.0pt'><span
    lang=EN-US style='font-family:Symbol'>?<span style='font:7.0pt "Times New Roman"'>        
    </span></span><span lang=EN-US>List 2</span></p>
    <p class=MsoListParagraphCxSpLast style='text-indent:-18.0pt'><span lang=EN-US
    style='font-family:Symbol'>?<span style='font:7.0pt "Times New Roman"'>        
    </span></span><span lang=EN-US>List 3</span></p>


You ask
yourself what you are looking at. This is HTML that has been saved from MS Word
and yes, there are websites out there that have been built with it. But in most
cases this is what happens when somebody pastes content from a Word file into
the CMS of your choice. 

What we want is this:
    
    <h2>My Heading</h2>
    <ul>
    <li>List 1</li>
    <li>List 2</li>
    <li>List 3</li>
    </ul>


Both of
those abominations can be accounted for using a simple JavaScript snippet and
the Aloha Editor. 

In my test
setting I have a textarea with the id ?text? where I put the broken code and
generate an HTML element from it. This is then fed to my little functions that
are triggered with a button.

    <!DOCTYPE html>
        <html>
        <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
        <title>Fixing HTML with Aloha Editor and jQuery</title>
        <link rel="stylesheet" href="index.css" type="text/css">
        <link rel="stylesheet" href="../../css/aloha.css" type="text/css">
        <script src="../../lib/require.js"></script>
        <script src="../../lib/vendor/jquery-1.7.2.js"></script>
        <script src="../../lib/aloha.js" data-aloha-plugins="common/ui,
                                    common/contenthandler,
                                    common/paste,
                                    common/commands,
                                    common/dom-to-xhtml
                                    "></script>
        </head>
        <body>
        <div>
            <span>HTML:</span><br/>
            <textarea name="text" id="text">
            </textarea><br/>
            <button id="normal">wait...</button>
            <button id="doit">wait...</button>
            <button id="xhtml">wait..</button>
        </div>
        <div id="main">
            <div id="content"><p>Fixing HTML with Aloha Editor and jQuery!</p></div>
        </div>
        <script type="text/javascript">
        Aloha.ready( function() {
            Aloha.require(['aloha/contenthandlermanager', 'dom-to-xhtml/dom-to-xhtml','aloha/ephemera'], function (Manager, domToXhtml, Ephemera) {
    
                Aloha.jQuery('#doit').html('Handled!').click(function(){
                    var dirty = Aloha.jQuery('#text').val();
                    var clean = Manager.handleContent(dirty, {
                        contenthandler: ['word', 'generic', 'blockelement', 'basic']
                    });
                    Aloha.jQuery('#content').html(clean);
                });
    
                Aloha.jQuery('#xhtml').html('XHTML!').click(function(){
                    var dirty = Aloha.jQuery('#text').val();
                    var editableElement = jQuery("<div>" + dirty + "</div>");
                    var clean = domToXhtml.contentsToXhtml(editableElement[0], Ephemera.ephemera());
                    Aloha.jQuery('#content').html(clean);
                });
    
                Aloha.jQuery('#normal').html('Normal!').click(function(){
                    var dirty = Aloha.jQuery('#text').val();
                    Aloha.jQuery('#content').html(dirty);
                });
            });
    
        });
        </script>
        </body>
        </html>
    

The
resulting HTML is nice and neat!

If you want to know how to load and use the Aloha Editor, read the [blog](/blog/using-aloha-editor) post I wrote about it.

I hope that
I was able to save you from a lot of pain and agony!