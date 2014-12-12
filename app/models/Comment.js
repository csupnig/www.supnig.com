var mongoose = require('mongoose'),
    q = require('q'),
    md5 = require('MD5'),
    nodemailer = require('nodemailer');
var env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    sendmailTransport = require('nodemailer-sendmail-transport');

CommentSchema = mongoose.Schema({
    name:    String,
    email:   String,
    md5mail: String,
    post:    String,
    comment: String,
    date:    Date
});

CommentSchema.statics.deleteComment = function(commentid) {
    var deferred = q.defer();
   Comment.find({ _id: commentid }).remove(function(err) {
        if (!err) {
            deferred.resolve();
        }
        else {
            deferred.reject();
        }
    });
    return deferred.promise;
};



// Create a new user given a profile
CommentSchema.statics.createComment = function(comment){
    var deferred = q.defer();
    comment.md5mail = md5(comment.email);
    Comment.create(
        comment,
        function(err, c){
            if(err) {
                deferred.reject(err);
            } else {
                var transport = nodemailer.createTransport(sendmailTransport( {
                    path: config.sendmail,
                    args: ["-t", "-f", config.adminemail]
                }));
                // setup e-mail data with unicode symbols
                var mailOptions = {
                    from: "Supnig Blog ["+config.adminemail+"]", // sender address
                    to: config.adminemail, // list of receivers
                    subject: "New Post on your blog - "+comment.post, // Subject line
                    text: "New Post on your blog - " + comment.post + " Text: " + comment.comment + " - by "+comment.email, // plaintext body
                    html: "New Post on your blog - " + comment.post + " Text: " + comment.comment + " - by "+comment.email // html body
                }

                // send mail with defined transport object
                transport.sendMail(mailOptions, function(error, response){
                    if(error){
                        console.log(error);
                    }else{
                        console.log("Message sent: " + response.message);
                    }
                });
                deferred.resolve(c);
            }
        }
    );

    return deferred.promise;
};

var Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;