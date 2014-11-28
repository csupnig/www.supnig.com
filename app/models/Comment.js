var mongoose = require('mongoose'),
    q = require('q'),
    md5 = require('MD5');


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
                deferred.resolve(c);
            }
        }
    );

    return deferred.promise;
};

var Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;