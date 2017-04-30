
var TwitterBotDBClient = require("./TwitterBotDBClient").TwitterBotDBClient;

var User = function() {
};

User.prototype.findOrCreate = function (obj, callback){
    console.log(JSON.stringify(obj, null, 4));
    TwitterBotDBClient.loadUser(obj.twitter.username).then(function(user) {
        console.log('Loaded user', JSON.stringify(user, null, 4));
        if (!user || user === null) {
            console.log('Need to create user');
            TwitterBotDBClient.createUser({
                user : obj.twitter.username,
                accessToken : obj.token,
                accessTokenSecret : obj.secret
            }).then(function() {
                callback(undefined, obj);
            }).catch(function(err) {
                console.log('Could not create user', JSON.stringify(err, null, 4));
                callback(undefined, obj);
            })
        } else {
            callback(undefined, obj);
        }
    }).catch(function(err) {
        console.log('Could not load user', JSON.stringify(err, null, 4));
        callback(undefined, obj);
    });
};

module.exports = new User();
