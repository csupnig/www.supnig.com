{{{
  "title": "Using Aloha Editor",
  "tags": ["JavaScript", "Aloha Editor", "contenteditable"],
  "category":"blog",
  "date": "Wed, 02 May 2012 17:03:24 GMT",
  "color":"violet"
}}}

Some of you might have seen the Aloha Editor in action. In this article I'm going to show you how to use the famous Aloha Editor and how to convert a commont textarea to an aloha editable and how to save the contents of it.
<!--more-->
Using Aloha Editor is quite easy. The First step is to go to [www.alohaeditor.org](http://www.alohaeditor.org) and download the latest release.

The second step is to include the aloha editor library and the aloha CSS-file.

    <!-- INCLUDE THE aloha.css -->;
    <link rel="stylesheet" href="css/aloha.css" id="aloha-style-include" type="text/css">
    <!-- INCLUDE THE aloha.js AND STATE ALL PLUGINS THAT SHOULD BE LOADED -->
    <script src="lib/aloha.js" data-aloha-plugins="common/format,
                    common/highlighteditables,
                    common/list,
                    common/undo,
                    common/table,
                    common/paste,
                    common/block,
                    common/dom-to-xhtml,
                    common/link,
                    extra/metaview"></script>


The final step is to convert our textarea to an aloha editable and add a handler to the submit event of the form where we will put the contentsof the aloha editable back into the textarea.

    <script type="text/javascript">
		Aloha.ready( function( ) {
				/*
				Aloha brings its own instance of jQuery, so we are going to use it.
				*/
				var jQuery = Aloha.jQuery;
				/*
				As soon as aloha editor is ready, we execute aloha() on the textarea.

				You can also do the same thing on another element that you want to make editable.
				*/
				jQuery('#content').aloha();

				jQuery('#form').submit(function(){
					/*
					Before the form is submitted, we unload aloha and store the contents of the
					aloha editable to the textarea.
					*/
					jQuery('#content').mahalo();
				});
		});
		</script>


You are now able to create your custom aloha editor form and send awesome contents to your backend where you can save and modify them to your needs.

The final code may look something like that:

    <!DOCTYPE html>
    <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8">
            <title>Aloha!</title>
            <!-- INCLUDE THE aloha.css -->
            <link rel="stylesheet" href="css/aloha.css" id="aloha-style-include" type="text/css">
            <style>
                textarea {
                    width:500px;
                    height:500px;
                }
            </style>
        </head>
        <body>
            <?php
            if(isset($_REQUEST["content"])) {
                /* 
                Here you can save the content to the database or use it however you want to ;)
                */
                echo $_REQUEST["content"];
            }
            ?>
            <form id="form" method="POST">
                <textarea id="content" class="article" name="content">
                    <p>Here goes your content</p>
                </textarea>
                <input type="submit" value="Submit">
            </form>
            <!-- INCLUDE THE aloha.js AND STATE ALL PLUGINS THAT SHOULD BE LOADED -->
            <script src="lib/aloha.js" data-aloha-plugins="common/format,
                                                        common/highlighteditables,
                                                        common/list,
                                                        common/undo,
                                                        common/table,
                                                        common/paste,
                                                        common/block,
                                                        common/dom-to-xhtml,
                                                        common/link,
                                                        extra/metaview"></script>
            <script type="text/javascript">
            Aloha.ready( function( ) {
                    /*
                    Aloha brings its own instance of jQuery, so we are going to use it.
                    */
                    var jQuery = Aloha.jQuery;
                    /*
                    As soon as aloha editor is ready, we execute aloha() on the textarea.
    
                    You can also do the same thing on another element that you want to make editable.
                    */
                    jQuery('#content').aloha();
    
                    jQuery('#form').submit(function(){
                        /*
                        Before the form is submitted, we unload aloha and store the contents of the
                        aloha editable to the textarea.
                        */
                        jQuery('#content').mahalo();
                    });
            });
            </script>
        </body>
    </html>
