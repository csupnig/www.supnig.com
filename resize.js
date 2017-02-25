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
            if (file.indexOf('thumb') < 0) {
                im.resize({
                    srcPath: fullpath,
                    dstPath: fullpath,
                    width: 500
                }, function(err, stdout, stderr) {
                    if (err) {
                        console.log(__dirname + '/public' + basename, err, stdout, stderr);
                    } else {
                        console.log('.');
                    }
                });
            }
        }
    });
}

doDir('public');
