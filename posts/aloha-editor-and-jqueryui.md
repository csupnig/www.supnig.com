{{{
  "title": "Aloha Editor and jQueryUI",
  "tags": ["aloha", "technology", "jquery"],
  "category":"blog",
  "date": "Sat, 28 Jul 2012 16:04:41 GMT",
  "color":"darkyellow",
  "slug":"aloha-editor-and-jqueryui"
}}}

This week a new Aloha Editor version has been released, containing the long awaited switch from ExtJS to jQueryUI. With this change not only the looks changed but also the distribution size was dramatically reduced and Aloha Editor will now be available under GPLv2. In this article I'll give a short update on how developing plugins changed explaining the metaview plugin that I already talked about in my other Aloha Editor articles.
<!--more-->
Roughly three months ago I gave a short outline of the metaview plugin, that can be used to display the underlying structure of your text, by making paragraphs, annotations and other HTML tags visible to the editor. In this article I'll show you the new implementation for the jQueryUI version of Aloha Editor.

Before you start developing your own plug-in, you should clone Aloha-Editor from github checkout the master branch that we will be using in this tutorial. Then go to Aloha-Editor/src/plugins/extra and create a new folder for your plug-in containing the files and folders on the picture. Our plugin is called "metaview".![Plug-in structure](http://images.supnig.com/media/pictures/alohapluginstructurenew.PNG)

The lib directory will contain all the JavaScript files for your plugin so we are creating the main file there and call it metaview-plugin.js.
    
    define([
        'aloha/plugin',
        'i18n!metaview/nls/i18n',
        'i18n!aloha/nls/i18n',
        'jquery'
    ], function(Plugin, i18n, i18nCore, jQuery) {
        'use strict';
    
        var Aloha = window.Aloha;
    
        /**
         * We create and return the plugin.
         */
        return Plugin.create('metaview', {
    
            /**
             * In our constructor we call the 
             * constructor of our superclass.
             */
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
    
            }
        });
    });


At the top we define all the require.js dependencies and pass the instances of the things we want to use to our plugin context. As you can see the plug-in structure is quite simple. It contains a constructor and an init method where the plug-in can be set up. 

We then create a button that will be shown in the format tab of the aloha floating menu. To do this, we must first add a dependency to the UI and the superclass for our button to the require.js dependencis. We add a small function to set up our buttons and call it in the init-function.

    define([
        'aloha/plugin',
        'ui/ui',
        'ui/toggleButton',
        'i18n!metaview/nls/i18n',
        'i18n!aloha/nls/i18n',
        'jquery'
    ], function(Plugin, Ui,	ToggleButton, i18n, i18nCore, jQuery) {
        'use strict';
    
        var Aloha = window.Aloha;
    
        /**
         * We create and return the plugin.
         */
        return Plugin.create('metaview', {
    
            /**
             * In our constructor we call the 
             * constructor of our superclass.
             */
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
                this.createButtons();
            },
    
            /**
             * Initialize the buttons
             */
            createButtons: function () {
                var that = this;
                //We tell the UI to adopt our button in the position "toggleMetaView"
                //and derive it from "ToggleButton"
                this._toggleMetaViewButton = Ui.adopt("toggleMetaView", ToggleButton, {
                    tooltip : i18n.t('button.switch-metaview.tooltip'),
                    icon: 'aloha-icon aloha-icon-metaview',
                    scope: 'Aloha.continuoustext',
                    click : function () { that.buttonClick(); }
                });
            }
        });
    });


The onclick-handler of the button will just add or remove a class of the editable area to switch to the "meta view" and back, making it possible to add special css styles to the elements. We use simple jQuery functions to do all the magic to the active editable area that we can access via Aloha.activeEditable.obj. We also tell our toggle button to change the state to action/inactive depending if the metaview has been activated.
		
		buttonClick: function() {
			if(jQuery(Aloha.activeEditable.obj).hasClass('aloha-metaview')) {
				jQuery(Aloha.activeEditable.obj).removeClass('aloha-metaview');
				this._toggleMetaViewButton.setState(false);
			} else {
				jQuery(Aloha.activeEditable.obj).addClass('aloha-metaview');
				this._toggleMetaViewButton.setState(true);
			}
		}


Since we also want the toggle button to be active when we switch to an editable area that is already in the "meta view" mode, we need to handle the event that is being triggered when activating an editable. We define the handler for the "aloha-editable-activated"-event in the init method.
		
		Aloha.bind("aloha-editable-activated", function (jEvent, aEvent) {
			if (jQuery(Aloha.activeEditable.obj).hasClass('aloha-metaview')) {
				that._toggleMetaViewButton.setState(true);
			} else {
				that._toggleMetaViewButton.setState(false);
			}
		});


We want to make our plugin configurable, so that we can define specific editables where the plugin should be available to the editor. Therefore we create a default config entry and some code to the "aloha-editable-activated" listener, where we check for the current configuration.
		
		//Change your code in the init function
		Aloha.bind("aloha-editable-activated", function (jEvent, aEvent) {
			var config = that.getEditableConfig( Aloha.activeEditable.obj );
			if (jQuery.type(config) === 'array' &amp;&amp; jQuery.inArray( 'metaview', config ) !== -1) {
				that._toggleMetaViewButton.show(true);
			} else {
				that._toggleMetaViewButton.show(false);
				return;
			}
			if (jQuery(Aloha.activeEditable.obj).hasClass('aloha-metaview')) {
				that._toggleMetaViewButton.setState(true);
			} else {
				that._toggleMetaViewButton.setState(false);
			}
		});

		//Add the default configuration to the plugin
		config: [ 'metaview' ], //If not defined otherwise, the plugin is available


We can now add a configuration to our page to make the editable only available in one editable. Assuming we have to editables, one with the id "content" and one with the id "teaser", the configuration looks like this:
	
	Aloha.settings = {
		plugins: {
			metaview: {
				config:[], //We deactivate it by default
				editables: {
					'#content': ["metaview"] //We enable it for the "content" editable
				}
			}
		}
	};


Now we have to place a button in the floating menu. We add a small icon to our img folder and create a "View" tab for our "toogleMetaView" position.
	
	Aloha.settings = {
		toolbar: {
			tabs: [
					{
						label: 'View',
						showOn: { scope: 'Aloha.continuoustext' },
						components: [
							[
								'toggleMetaView'
							]
						]
					}
			    ]	
		},
		plugins: {
			metaview: {
				config:[], //We deactivate it by default
				editables: {
					'#content': ["metaview"] //We enable it for the "content" editable
				}
			}
		}
	};


Having the javascript and the configuration of our plug-in ready, we can start to add css definitions for our button and to outline the elements in the editable. Therefore we create a css file in the css directory of the plug-in, call it metaview.css.
    
    .aloha-icon-metaview { background: url(../img/button.png) no-repeat 0px 0px !important; }
    
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


You can further improve this plug-in by adding support for more elements that are going to be outlined by the plugin or by making the outline prettier. Please feel free to ask questions or post suggestions in the comments below!

On Github you can find the full source for this plugin and many more: [https://github.com/alohaeditor/Aloha-Editor ](https://github.com/alohaeditor/Aloha-Editor )

Visit the home of Aloha Editor: [http://www.aloha-editor.org](http://www.aloha-editor.org)