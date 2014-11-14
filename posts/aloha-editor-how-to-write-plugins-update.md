{{{
  "title": "Aloha Editor - How to write plugins update",
  "tags": ["Aloha Editor", "contenteditable", "JavaScript", "plugins"],
  "category": "work",
  "date": "Sat, 21 Apr 2012 18:01:51 GMT",
  "color":"darkorange"
}}}

Since I wrote my last article about this topic there have been numerous improvements made to aloha editor that made it one of the most successful newcommers on the web. Some of those changes were made to the way you write plugins and therefore I decided that it is time to give you a little heads up on what has changed and how plugins are written for the aloha editor.
<!--more-->
In this article I'm going to use the same plugin I used 9 months ago and show you what has changed. Our plugin will outline the structure of the content, so that the editor can see where a paragraph starts and what kinds of annotations he used in the content. 
It'll be very easy to customize, so that new annotationsand elements can be added in a minute.

Before you start developing your own plug-in, you should clone Aloha-Editor from github with all its submodules and checkout the master branch that we will be using in this tutorial.Then go to Aloha-Editor/src/plugins/extra and create a new folder for your plug-in containing the files and folders on the picture. We will call ours "metaview". ![Plug-in structure](http://images.supnig.com/media/pictures/alohapluginstructurenew.PNG)

The lib directory will contain all the JavaScript files for your plugin so we are creating the main file there and call it metaview-plugin.js. 

    /*!
    * Aloha Editor
    * Author &amp; Copyright (c) 2010 Gentics Software GmbH
    * aloha-sales@gentics.com
    * Licensed unter the terms of http://www.aloha-editor.com/license.html
    */
    define(
    ['aloha/plugin', 'aloha/floatingmenu', 'i18n!metaview/nls/i18n', 'i18n!aloha/nls/i18n', 'aloha/jquery', 'css!metaview/css/metaview.css'],
    function(Plugin, FloatingMenu, i18n, i18nCore, jQuery) {
        "use strict";
    
        var	Aloha = window.Aloha;
    
         return Plugin.create('metaview', {
            _constructor: function(){
                this._super('metaview');
            },
    
            /**
             * Initialize the plugin
             */
            init: function () {
            }
        });
    });

At the top we define all the [require.js](http://requirejs.org/) dependencies and pass the instances of the things we want to use to our plugin context. As you can see the plug-in structure is quite simple. It contains a constructor and an init method where the plug-in can be set up. We then create a button that will be shown in the format tab of the aloha floating menu.
		
    var that = this;

    that.button = new Aloha.ui.Button({
        'name' : 'meta',
        'iconClass' : 'aloha-button aloha-button-metaview',
        'size' : 'small',
        'onclick' : function () { that.buttonClick(); },
        'tooltip' : i18n.t('button.switch-metaview.tooltip'),
        'toggle' : true
    });
    FloatingMenu.addButton(
        'Aloha.continuoustext',
        that.button,
        i18nCore.t('floatingmenu.tab.format'),
        1
    );	

The onclick-handler of the button will just add or remove a class of the editable area to switch to the "meta view" and back, making it possible to add special css styles to the elements.We use simple jQuery functions to do all the magic to the active editable area that we can access via Aloha.activeEditable.obj.
		
    buttonClick: function() {
        var that = this;
        if(jQuery(Aloha.activeEditable.obj).hasClass('aloha-metaview')) {
            jQuery(Aloha.activeEditable.obj).removeClass('aloha-metaview');
            that.button.setPressed(false);
        } else {
            jQuery(Aloha.activeEditable.obj).addClass('aloha-metaview');
            that.button.setPressed(true);
        }
    }

Since we also want the button to be pressed when we switch to an editable area that is already in the "meta view" mode, we need to handle the event that is being triggered in such a case. We define the handler for the "aloha-editable-activated"-event in the init method and also create our buttons there. The final code should look something like this:

    /*!
    * Aloha Editor
    * Author &amp; Copyright (c) 2010 Gentics Software GmbH
    * aloha-sales@gentics.com
    * Licensed unter the terms of http://www.aloha-editor.com/license.html
    */
    define(
    ['aloha/plugin', 'aloha/floatingmenu', 'i18n!metaview/nls/i18n', 'i18n!aloha/nls/i18n', 'aloha/jquery', 'css!metaview/css/metaview.css'],
    function(Plugin, FloatingMenu, i18n, i18nCore, jQuery) {
        "use strict";
    
        var
            $ = jQuery,
            GENTICS = window.GENTICS,
            Aloha = window.Aloha;
    
         return Plugin.create('metaview', {
            _constructor: function(){
                this._super('metaview');
            },
    
            /**
             * Configure the available languages
             */
            languages: ['en', 'de'],
    
            /**
             * Initialize the plugin
             */
            init: function () {
                var that = this;
    
                this.createButtons();
    
                // mark active Editable with a css class
                Aloha.bind(
                        "aloha-editable-activated",
                        function (jEvent, aEvent) {
                            if(jQuery(Aloha.activeEditable.obj).hasClass('aloha-metaview')) {
                                that.button.setPressed(true);
                            } else {
                                that.button.setPressed(false);
                            }
                        }
                );
            },
    
            buttonClick: function() {
                var that = this;
                if(jQuery(Aloha.activeEditable.obj).hasClass('aloha-metaview')) {
                    jQuery(Aloha.activeEditable.obj).removeClass('aloha-metaview');
                    that.button.setPressed(false);
                } else {
                    jQuery(Aloha.activeEditable.obj).addClass('aloha-metaview');
                    that.button.setPressed(true);
                }
            },
    
            /**
             * Initialize the buttons
             */
            createButtons: function () {
                var that = this;
    
                that.button = new Aloha.ui.Button({
                    'name' : 'meta',
                    'iconClass' : 'aloha-button aloha-button-metaview',
                    'size' : 'small',
                    'onclick' : function () { that.buttonClick(); },
                    'tooltip' : i18n.t('button.switch-metaview.tooltip'),
                    'toggle' : true
                });
                FloatingMenu.addButton(
                    'Aloha.continuoustext',
                    that.button,
                    i18nCore.t('floatingmenu.tab.format'),
                    1
                );			
            }
        });
    });

Having the javascript of our plug-in ready, we can start to add css definitions to outline the elements in the editable. Therefore we create a css file in the css directory of the plug-in, call it metaview.css and add it to the require.js dependencies.

    .aloha-metaview p, .aloha-metaview pre,
    .aloha-metaview h1, .aloha-metaview h2,
    .aloha-metaview h3, .aloha-metaview h4,
    .aloha-metaview h5, .aloha-metaview h6,
    .aloha-metaview blockquote, 
    .aloha-metaview ol, .aloha-metaview ul, 
    .aloha-metaview div, .aloha-metaview dl, 
    .aloha-metaview dt, .aloha-metaview dd, 
    .aloha-metaview td, .aloha-metaview th, 
    .aloha-metaview table, .aloha-metaview caption {
      background: white no-repeat 2px 2px;
      padding: 8px 5px 5px;
      margin: 10px;
      border: 1px solid #ddd;
      min-height: 1em;
    }

The plug-in is now ready for use. You can improve it by adding support for more elements that are going to be outlined by the plugin. Please feel free to ask questions or post suggestions in the comments below!

Visit the github repository of the Aloha Editor to find this plugin and many more: [https://github.com/alohaeditor/Aloha-Editor](https://github.com/alohaeditor/Aloha-Editor) 