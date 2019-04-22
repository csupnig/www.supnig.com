declare var Masonry:any;
(function () {

    'use strict';
    var timer;
    var $container = $('#firstposts');

    var doMlayout = function () {

        var w = $container.width(),
            columnNum = 1,
            columnWidth = 0;
        if (w > 1200) {
            columnNum = 3;
        } else if (w > 900) {
            columnNum = 3;
        } else if (w > 600) {
            columnNum = 2;
        } else if (w > 300) {
            columnNum = 1;
        }
        w = w - (10 * 2 * columnNum);
        columnWidth = Math.floor(w / columnNum);
        $container.find('.item').css({'width': columnWidth});
        console.log('do layout');
        var msnry = new Masonry($container[0], {
            // options
            itemSelector: '.item'
        });
    };
    if($container.length>0) {
        jQuery(window).on('load', doMlayout);
        $(window).on('resize', function () {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(doMlayout, 10);
        });
    }
}());
