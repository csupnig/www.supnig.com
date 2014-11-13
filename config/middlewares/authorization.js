var User = require('../../app/models/User');

var config = {};

var Auth = function(conf) {
    config = conf;
};

Auth.prototype.isAuthenticated = function (req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect("/login");
    }
};

Auth.prototype.isAdmin = function (req, res, next){
    if(req.isAuthenticated() && req.user.email == config.adminemail){
        next();
    }else{
        res.redirect("/login");
    }
}

Auth.prototype.userExist = function(req, res, next) {
    User.count({
        email: req.body.email
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            res.redirect("/signup");
        }
    });
}

module.exports = function(configuration){
    return new Auth(configuration);
};
