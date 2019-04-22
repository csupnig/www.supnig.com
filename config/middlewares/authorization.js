var User = require('../../app/models/User');

var config = {};

var Auth = function(conf) {
    config = conf;
};

Auth.prototype.isAuthenticated = function (req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect("/auth/twitter");
    }
};

module.exports = function(configuration){
    return new Auth(configuration);
};
