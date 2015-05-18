{{{
  "title": "Aloha Editor - The ease of writing plugins",
  "tags": ["Aloha Editor", "contenteditable", "JavaScript"],
  "category":"tech",
  "date": "Mon, 11 Jul 2011 18:46:30 GMT",
  "color":"yellow",
  "slug":"aloha-editor-the-ease-of-writing-plugins"
}}}

Aloha Editor is the new and shiny web based HTML5 Editor that enables you to edit your content right in place?without the need for iframes or other ugly hacks. It is very easy to use and lets you instantaneously see all?the changes you make. And since we all want a piece of that cake and often need to add custom functionality, I'm going to tell you how to write your first Aloha Editor plug-in.
<!--more-->
Our plugin will outline the structure of the content, so that the editor can see where a paragraph starts and what kinds of annotations he used in the content. 

It'll be very easy to customize, so that new annotationsand elements can be added in a minute.

Before you start developing your own plug-in, you should clone [Aloha-Editor from github](https://github.com/alohaeditor/Aloha-Editor) with all its submodules and checkout the **0.10 branch** that we will be using in this tutorial.
Then go to Aloha-Editor/src/plugin and create a new folder for your plug-in containing the files and folders on the picture.
![Plug-in structure](/media/pictures/alohapluginstructure.png)

In the src directory of your plug-in, create a javascript file that will contain all the logic for your plug-in:

    (function(window, undefined) {	"use strict";
      var jQuery = window.alohaQuery || window.jQuery, 
      $ = jQuery, Aloha = window.Aloha;
    
      Aloha.MetaView = new (Aloha.Plugin.extend({	
        _constructor: function(){
          this._super('metaview');
        },
      
        /*** Configure the available languages*/	
        languages: ['en', 'de'],
    
        /*** Initialize the plugin */	
        init: function () { 
        }	
    }))();
    })(window);

As you can see the plug-in structure is quite simple. It contains a constructor and an init method where the plug-in can be set up.
We then create a button that will be shown in the format tab of the aloha floating menu.

    var that = this;	    
    //create the button	
    that.button = new Aloha.ui.Button({	
      'iconClass' : 'aloha-button aloha-button-metaview',
      'size' : 'small',	
      'onclick' : that.buttonClick,	
      'tooltip' : this.i18n('button.switch-metaview.tooltip'),	
      'toggle' : true});	
    
      //add the button the the floating menu	
      Aloha.FloatingMenu.addButton(
        'Aloha.continuoustext',	
        that.button,	
        Aloha.i18n(Aloha, 'floatingmenu.tab.format'),	
        1);

The onclick-handler of the button will just add or remove a class of the editable area to switch to the "meta view" and back, making it possible to add special css styles to the elements.We use simple jQuery functions to do all the magic to the active editable area that we can access via **Aloha.activeEditable.obj**.

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


Since we also want the button to be pressed when we switch to an editable area that is already in the "meta view" mode, we need to handle the event that is being triggered in such a case. We define the handler for the "**aloha-editable-activated**"-event in the init method and also create our buttons there. The final code should look something like this:

    (function(window, undefined) {	"use strict";
      var jQuery = window.alohaQuery || window.jQuery, 
      $ = jQuery, Aloha = window.Aloha;
    
      Aloha.MetaView = new (Aloha.Plugin.extend({	
         _constructor: function(){	
               this._super('metaview');	
        },	
    
        /*** Configure the available languages*/	
        languages: ['en', 'de'],
    
        /*** Initialize the plugin*/	
        init: function () {	
           var that = this;	
           this.createButtons();				
          // mark active Editable with a css class			
          Aloha.bind("aloha-editable-activated",function (jEvent, aEvent) {
            if(jQuery(Aloha.activeEditable.obj).hasClass('aloha-metaview')) {
              that.button.setPressed(true);
            } else {
              that.button.setPressed(false);
            }
          });
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
    
        /*** Initialize the buttons*/
        createButtons: function () {
          var that = this;
          that.button = new Aloha.ui.Button({
            'iconClass' : 'aloha-button aloha-button-metaview',
            'size' : 'small',
            'onclick' : function () { that.buttonClick(); },
            'tooltip' : this.i18n('button.switch-metaview.tooltip'),
            'toggle' : true
          });
          Aloha.FloatingMenu.addButton(
            'Aloha.continuoustext',
            that.button,
            Aloha.i18n(Aloha, 'floatingmenu.tab.format'),
            1
          );
        }	
      }))();
    })(window);

Having the javascript of our plug-in ready, we can start to add css definitions to outline the elements in the editable. Therefore we create a css file in the src directory of the plug-in.

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

Using the package.json file in the plug-in root directory, we finally can tell aloha what files it needs to load for our plug-in.

    {
      "css":["src/metaview.css"],
      "js":["src/metaview.js"]
    }

The plug-in is now ready for use. Please feel free to ask questions or post suggestions in the comments below!

You can find the final plug-in in github: [https://github.com/alohaeditor/Aloha-Plugin-MetaView](https://github.com/alohaeditor/Aloha-Plugin-MetaView)

**Links:**

[http://www.aloha-editor.org/](http://www.aloha-editor.org/)

[https://github.com/alohaeditor/Aloha-Editor](https://github.com/alohaeditor/Aloha-Editor)