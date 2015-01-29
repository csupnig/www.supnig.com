/**
 * Created by christopher on 22/01/15.
 */

declare var skrollr:any;
// Init Skrollr

$(function(){
    if ($('#blog').length<=0) {
        console.log('init scrollr');
        var s = skrollr.init();
    }
});
