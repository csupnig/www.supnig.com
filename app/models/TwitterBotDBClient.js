"use strict";
/**
 * Created by christopher on 27/03/2017.
 */
var AWS = require("aws-sdk");
var KMSCrypto = require('./KMSCrypto').KMSCrypto;
AWS.config.update({
    region: "eu-central-1"
});
var TBFollower = (function () {
    function TBFollower(user, date, followerid) {
        this.user = user;
        this.date = date;
        this.followerid = followerid;
    }
    return TBFollower;
}());
exports.TBFollower = TBFollower;
var TBUser = (function () {
    function TBUser(user, access_token, access_token_secret, source) {
        this.user = user;
        this.access_token = access_token;
        this.access_token_secret = access_token_secret;
        this.source = source;
    }
    return TBUser;
}());
exports.TBUser = TBUser;
var TwitterBotDBClient = (function () {
    function TwitterBotDBClient() {
    }
    TwitterBotDBClient.loadUser = function (userhandle) {
        var docClient = new AWS.DynamoDB.DocumentClient();
        return new Promise(function (resolve, reject) {
            var params = {
                TableName: "twitter_users",
                Key: {
                    "user": userhandle
                }
            };
            docClient.get(params, function (err, data) {
                if (err) {
                    console.log('ERROR WHILE GETTING USER');
                    reject(err);
                }
                else {
                    if (data.Item) {
                        console.log('Found and using user: ', data.Item["user"]);
                        var user = new TBUser(data.Item["user"], data.Item["access_token"], data.Item["access_token_secret"], data.Item["source"].values);
                        resolve(user);
                    } else {
                        resolve(undefined)
                    }
                }
            });
        });
    };
    TwitterBotDBClient.createUser = function (user) {
        var docClient = new AWS.DynamoDB.DocumentClient();
        var tokeninfo = {};
        return new Promise(function (resolve, reject) {
            KMSCrypto.encrypt('arn:aws:kms:eu-central-1:725308806326:key/fad35b8b-7eb8-4233-8181-f097438169d6', new Buffer(user.accessToken)).then(function (res) {
                console.log('ENC', res.toString('base64'));
                tokeninfo.accessToken = res.toString('base64');
                return KMSCrypto.encrypt('arn:aws:kms:eu-central-1:725308806326:key/fad35b8b-7eb8-4233-8181-f097438169d6', new Buffer(user.accessTokenSecret));
            }).then(function (res) {
                console.log('ENC2', res.toString('base64'));
                tokeninfo.accessTokenSecret = res.toString('base64');
                docClient.put({
                    TableName: "twitter_users",
                    Item: {
                        "user": user.user,
                        "access_token": tokeninfo.accessToken,
                        "access_token_secret": tokeninfo.accessTokenSecret,
                        "source":docClient.createSet(['csupnig'])
                    }
                }, function (err , data ) {
                    if (err) {
                        console.log('Could not insert twitter user', JSON.stringify(err, null, 4));
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            }).catch(function (err) {
                console.log('shit', JSON.stringify(err, null, 4));
                reject(err);
            });

        });
    };
    TwitterBotDBClient.updateSource = function (user, src) {
        var docClient = new AWS.DynamoDB.DocumentClient();
        return new Promise(function (resolve, reject) {

            docClient.update({
                TableName: "twitter_users",
                Key:{
                    "user": user
                },
                UpdateExpression: "set #src = :s",
                ExpressionAttributeValues:{
                    ":s": docClient.createSet(src)
                },
                ExpressionAttributeNames: {
                    "#src": "source"
                },
                ReturnValues:"UPDATED_NEW"
            }, function (err , data ) {
                if (err) {
                    console.log('Could not update twitter user', JSON.stringify(err, null, 4));
                    reject(err);
                } else {
                    resolve(data);
                }
            });

        });
    };
    return TwitterBotDBClient;
}());
exports.TwitterBotDBClient = TwitterBotDBClient;
