var mongoose = require('mongoose'),
    q = require('q'),
    md5 = require('MD5'),
    nodemailer = require('nodemailer');
var env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    sendmailTransport = require('nodemailer-sendmail-transport');

IPBlockSchema = mongoose.Schema({
    ipaddress : String
});

IPBlockSchema.statics.isBlocked = function(ip) {
    var deferred = q.defer();
    IPBlock.findOne({ipaddress:ip}, function(err, blocked){
        if (!err) {
            deferred.resolve(blocked ? true : false);
        }
        else {
            deferred.resolve(false);
        }
    });
    return deferred.promise;
};

var IPBlock = mongoose.model("IPBlock", IPBlockSchema);
module.exports = IPBlock;
