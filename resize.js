var fs = require('fs'),
    im = require('node-imagemagick');




function doDir(dirname) {
    console.log('starting with ' + dirname);
    fs.readdirSync(__dirname + '/' + dirname).forEach(function (file) {
        console.log('checking ', file);
        var fullpath = __dirname + '/' + dirname + '/' + file;
        if (fs.lstatSync(fullpath).isDirectory()) {
            doDir(dirname + '/' + file);
        } else {
            if (file.indexOf('thumb') < 0 && file.indexOf('background') < 0) {
                resizeSingle(fullpath);
            }
        }
    });
}

function resizeSingle(fullpath) {
    im.resize({
        srcPath: fullpath,
        dstPath: fullpath,
        width: 1300
    }, function(err, stdout, stderr) {
        if (err) {
            console.log(__dirname + '/public' + fullpath, err, stdout, stderr);
        } else {
            console.log('.');
        }
    });
}

doDir('public');
//resizeSingle(__dirname + '/public/media/pictures/labtest2.png');
