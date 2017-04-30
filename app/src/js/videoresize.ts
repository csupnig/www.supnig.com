
(function () {

    'use strict';

    function fitToWidth($inner, $outer) {
        var size = $outer.width();
        var ratio = $inner.width() / $inner.height();
        $inner.css({
            width  : size,
            height : 'auto'
        });
        if (($outer.height() - $inner.height()) / 2 < 0) {
            $inner.css({
                top: ($outer.height() - $inner.height()) / 2,
                left: 0
            });
        }
    }

    function fitToHeight($inner, $outer) {
        var size = $outer.height();
        var ratio = $inner.width() / $inner.height();
        $inner.css({
            width  : 'auto',
            height : size
        });
        $inner.css({
            top  : 0,
            left : ($outer.width() - $inner.width()) / 2
        });
    }

    var isMobile = (function (agent) {
        return (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(agent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0,4))
        );
    })(navigator.userAgent || navigator.vendor || window['opera']);

    $(function () {
        var $inner = $('.cover');
        var $outer = $inner.parent();
        var $pagetop = $('#page-top');
        var timer;
        function cover() {
            var diffW = $outer.width() - $inner.width();
            var diffH = $outer.height() - $inner.height();
            if (diffW < 0 && diffH < 0) {
                /*if ($outer.height() > $outer.width()) {
                    fitToHeight($inner, $outer);
                }*/
            } else {
                if (Math.abs(diffW) > Math.abs(diffH)) {
                    fitToWidth($inner, $outer);
                } else {
                    fitToHeight($inner, $outer);
                }
            }
            $pagetop.css('padding',0);
            $pagetop.css('padding-top',$outer.height());
        }
        $(window).on('resize', function () {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(cover, 10);
        });
        cover();
        if (!isMobile) {
            $('video').on('loadeddata', function () {
                $(this).css('visibility', 'visible');
                cover();
            });
        }
    });

}());

/*

 jQuery Tags Input Plugin 1.3.3

 Copyright (c) 2011 XOXCO, Inc

 Documentation for this plugin lives here:
 http://xoxco.com/clickable/jquery-tags-input

 Licensed under the MIT license:
 http://www.opensource.org/licenses/mit-license.php

 ben@xoxco.com

 */

(function($) {

    var delimiter = new Array();
    var tags_callbacks = new Array();
    $.fn.doAutosize = function(o){
        var minWidth = $(this).data('minwidth'),
            maxWidth = $(this).data('maxwidth'),
            val = '',
            input = $(this),
            testSubject = $('#'+$(this).data('tester_id'));

        if (val === (val = input.val())) {return;}

        // Enter new content into testSubject
        var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        testSubject.html(escaped);
        // Calculate new width + whether to change
        var testerWidth = testSubject.width(),
            newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
            currentWidth = input.width(),
            isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
                || (newWidth > minWidth && newWidth < maxWidth);

        // Animate width
        if (isValidWidthChange) {
            input.width(newWidth);
        }


    };
    $.fn.resetAutosize = function(options){
        // alert(JSON.stringify(options));
        var minWidth =  $(this).data('minwidth') || options.minInputWidth || $(this).width(),
            maxWidth = $(this).data('maxwidth') || options.maxInputWidth || ($(this).closest('.tagsinput').width() - options.inputPadding),
            val = '',
            input = $(this),
            testSubject = $('<tester/>').css({
                position: 'absolute',
                top: -9999,
                left: -9999,
                width: 'auto',
                fontSize: input.css('fontSize'),
                fontFamily: input.css('fontFamily'),
                fontWeight: input.css('fontWeight'),
                letterSpacing: input.css('letterSpacing'),
                whiteSpace: 'nowrap'
            }),
            testerId = $(this).attr('id')+'_autosize_tester';
        if(! ($('#'+testerId).length > 0)){
            testSubject.attr('id', testerId);
            testSubject.appendTo('body');
        }

        input.data('minwidth', minWidth);
        input.data('maxwidth', maxWidth);
        input.data('tester_id', testerId);
        input.css('width', minWidth);
    };

    $.fn.addTag = function(value,options) {
        options = jQuery.extend({focus:false,callback:true},options);
        this.each(function() {
            var id = $(this).attr('id');
            var skipTag = false;
            var tagslist = $(this).val().split(delimiter[id]);
            if (tagslist[0] == '') {
                tagslist = new Array();
            }

            value = jQuery.trim(value);

            if (options.unique) {
                skipTag = $(this).tagExist(value);
                if(skipTag == true) {
                    //Marks fake input as not_valid to let styling it
                    $('#'+id+'_tag').addClass('not_valid');
                }
            } else {
                skipTag = false;
            }

            if (value !='' && skipTag != true) {
                $('<span>').addClass('tag').append(
                    $('<span>').text(value).append('&nbsp;&nbsp;'),
                    $('<a>', {
                        href  : '#',
                        title : 'Removing tag',
                        text  : 'x'
                    }).click(function () {
                        return $('#' + id).removeTag(value);
                    })
                ).insertBefore('#' + id + '_addTag');

                tagslist.push(value);

                $('#'+id+'_tag').val('');
                if (options.focus) {
                    $('#'+id+'_tag').focus();
                } else {
                    $('#'+id+'_tag').blur();
                }

                $.fn.tagsInput.updateTagsField(this,tagslist);

                if (options.callback && tags_callbacks[id] && tags_callbacks[id]['onAddTag']) {
                    var f = tags_callbacks[id]['onAddTag'];
                    f.call(this, value);
                }
                if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
                {
                    var i = tagslist.length;
                    var f = tags_callbacks[id]['onChange'];
                    f.call(this, $(this), tagslist[i-1]);
                }
            }

        });

        return false;
    };

    $.fn.removeTag = function(value) {
        value = value;
        this.each(function() {
            var id = $(this).attr('id');

            var old = $(this).val().split(delimiter[id]);

            $('#'+id+'_tagsinput .tag').remove();
            var str = '', i;
            for (i=0; i< old.length; i++) {
                if (old[i]!=value) {
                    str = str + delimiter[id] +old[i];
                }
            }

            $.fn.tagsInput.importTags(this,str);

            if (tags_callbacks[id] && tags_callbacks[id]['onRemoveTag']) {
                var f = tags_callbacks[id]['onRemoveTag'];
                f.call(this, value);
            }
        });

        return false;
    };

    $.fn.tagExist = function(val) {
        var id = $(this).attr('id');
        var tagslist = $(this).val().split(delimiter[id]);
        return (jQuery.inArray(val, tagslist) >= 0); //true when tag exists, false when not
    };

    // clear all existing tags and import new ones from a string
    $.fn.importTags = function(str) {
        var id = $(this).attr('id');
        $('#'+id+'_tagsinput .tag').remove();
        $.fn.tagsInput.importTags(this,str);
    }

    $.fn.tagsInput = function(options) {
        var settings = jQuery.extend({
            interactive:true,
            defaultText:'add a tag',
            minChars:0,
            width:'300px',
            height:'100px',
            autocomplete: {selectFirst: false },
            hide:true,
            delimiter: ',',
            unique:true,
            removeWithBackspace:true,
            placeholderColor:'#666666',
            autosize: true,
            comfortZone: 20,
            inputPadding: 6*2
        },options);

        var uniqueIdCounter = 0;

        this.each(function() {
            // If we have already initialized the field, do not do it again
            if (typeof $(this).attr('data-tagsinput-init') !== 'undefined') {
                return;
            }

            // Mark the field as having been initialized
            $(this).attr('data-tagsinput-init', 'true');

            if (settings.hide) {
                $(this).hide();
            }
            var id = $(this).attr('id');
            if (!id || delimiter[$(this).attr('id')]) {
                id = $(this).attr('id', 'tags' + new Date().getTime() + (uniqueIdCounter++)).attr('id');
            }

            var data = jQuery.extend({
                pid:id,
                real_input: '#'+id,
                holder: '#'+id+'_tagsinput',
                input_wrapper: '#'+id+'_addTag',
                fake_input: '#'+id+'_tag'
            },settings);

            delimiter[id] = data.delimiter;

            if (settings.onAddTag || settings.onRemoveTag || settings.onChange) {
                tags_callbacks[id] = new Array();
                tags_callbacks[id]['onAddTag'] = settings.onAddTag;
                tags_callbacks[id]['onRemoveTag'] = settings.onRemoveTag;
                tags_callbacks[id]['onChange'] = settings.onChange;
            }

            var markup = '<div id="'+id+'_tagsinput" class="tagsinput"><div id="'+id+'_addTag">';

            if (settings.interactive) {
                markup = markup + '<input id="'+id+'_tag" value="" data-default="'+settings.defaultText+'" />';
            }

            markup = markup + '</div><div class="tags_clear"></div></div>';

            $(markup).insertAfter(this);

            $(data.holder).css('width',settings.width);
            $(data.holder).css('min-height',settings.height);
            $(data.holder).css('height',settings.height);

            if ($(data.real_input).val()!='') {
                $.fn.tagsInput.importTags($(data.real_input),$(data.real_input).val());
            }
            if (settings.interactive) {
                $(data.fake_input).val($(data.fake_input).attr('data-default'));
                $(data.fake_input).css('color',settings.placeholderColor);
                $(data.fake_input).resetAutosize(settings);

                $(data.holder).bind('click',data,function(event) {
                    $(event.data.fake_input).focus();
                });

                $(data.fake_input).bind('focus',data,function(event) {
                    if ($(event.data.fake_input).val()==$(event.data.fake_input).attr('data-default')) {
                        $(event.data.fake_input).val('');
                    }
                    $(event.data.fake_input).css('color','#000000');
                });

                if (settings.autocomplete_url != undefined) {
// nothing

                } else {
                    // if a user tabs out of the field, create a new tag
                    // this is only available if autocomplete is not used.
                    $(data.fake_input).bind('blur',data,function(event) {
                        var d = $(this).attr('data-default');
                        if ($(event.data.fake_input).val()!='' && $(event.data.fake_input).val()!=d) {
                            if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
                                $(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
                        } else {
                            $(event.data.fake_input).val($(event.data.fake_input).attr('data-default'));
                            $(event.data.fake_input).css('color',settings.placeholderColor);
                        }
                        return false;
                    });

                }
                // if user types a default delimiter like comma,semicolon and then create a new tag
                $(data.fake_input).bind('keypress',data,function(event) {
                    if (_checkDelimiter(event)) {
                        event.preventDefault();
                        if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
                            $(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
                        $(event.data.fake_input).resetAutosize(settings);
                        return false;
                    } else if (event.data.autosize) {
                        $(event.data.fake_input).doAutosize(settings);

                    }
                });
                //Delete last tag on backspace
                data.removeWithBackspace && $(data.fake_input).bind('keydown', function(event)
                {
                    if(event.keyCode == 8 && $(this).val() == '')
                    {
                        event.preventDefault();
                        var last_tag = $(this).closest('.tagsinput').find('.tag:last').text();
                        var id = $(this).attr('id').replace(/_tag$/, '');
                        last_tag = last_tag.replace(/[\s]+x$/, '');
                        $('#' + id).removeTag(last_tag);
                        $(this).trigger('focus');
                    }
                });
                $(data.fake_input).blur();

                //Removes the not_valid class when user changes the value of the fake input
                if(data.unique) {
                    $(data.fake_input).keydown(function(event){
                        if(event.keyCode == 8 || String.fromCharCode(event.which).match(/\w+|[áéíóúÁÉÍÓÚñÑ,/]+/)) {
                            $(this).removeClass('not_valid');
                        }
                    });
                }
            } // if settings.interactive
        });

        return this;

    };

    $.fn.tagsInput.updateTagsField = function(obj,tagslist) {
        var id = $(obj).attr('id');
        $(obj).val(tagslist.join(delimiter[id]));
    };

    $.fn.tagsInput.importTags = function(obj,val) {
        $(obj).val('');
        var id = $(obj).attr('id');
        var tags = val.split(delimiter[id]);
        var i;
        for (i=0; i<tags.length; i++) {
            $(obj).addTag(tags[i],{focus:false,callback:false});
        }
        if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
        {
            var f = tags_callbacks[id]['onChange'];
            f.call(obj, obj, tags[i]);
        }
    };

    /**
     * check delimiter Array
     * @param event
     * @returns {boolean}
     * @private
     */
    var _checkDelimiter = function(event){
        var found = false;
        if (event.which == 13) {
            return true;
        }

        if (typeof event.data.delimiter === 'string') {
            if (event.which == event.data.delimiter.charCodeAt(0)) {
                found = true;
            }
        } else {
            $.each(event.data.delimiter, function(index, delimiter) {
                if (event.which == delimiter.charCodeAt(0)) {
                    found = true;
                }
            });
        }

        return found;
    }
})(jQuery);
