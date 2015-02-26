$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - $(window).height()/3
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });


    $('.colorbox').colorbox({rel:"colorbox", scale:true, maxWidth:"100%", maxHeight:"100%"});
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

var cbpAnimatedHeader = (function() {

    var docElem = document.documentElement,
        $header = $( '.navbar-default' ),
        $headersection = $('header'),
        didScroll = false,
        changeHeaderOn = 100;

    function init() {
        window.addEventListener( 'scroll', function( event ) {
            if( !didScroll ) {
                didScroll = true;
                setTimeout( scrollPage, 250 );
            }
        }, false );
    }

    function scrollPage() {
        var sy = scrollY();
        if (!$header.hasClass('navbar-always')) {
            if (sy >= changeHeaderOn) {
                $header.addClass('navbar-shrink');
                $headersection.addClass('navbar-shrink');
            }
            else {
                $header.removeClass('navbar-shrink');
                $headersection.removeClass('navbar-shrink');
            }
        }
        didScroll = false;
    }

    function scrollY() {
        return window.pageYOffset || docElem.scrollTop;
    }

    init();

})();