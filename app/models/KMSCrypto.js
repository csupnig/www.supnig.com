"use strict";
var AWS = require('aws-sdk');
var KMSCrypto = (function () {
    function KMSCrypto() {
    }
    KMSCrypto.decrypt = function (data) {
        AWS.config.apiVersions = {
            kms: '2014-11-01'
        };
        AWS.config.region = 'eu-central-1';
        var kms = new AWS.KMS();
        var params = {
            CiphertextBlob: data
        };
        return new Promise(function (resolve, reject) {
            kms.decrypt(params, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.Plaintext);
                }
            });
        });
    };
    KMSCrypto.encrypt = function (keyId, plaintext) {
        var params = {
            KeyId: keyId,
            Plaintext: plaintext
        };
        AWS.config.apiVersions = {
            kms: '2014-11-01'
        };
        AWS.config.region = 'eu-central-1';
        var kms = new AWS.KMS();
        return new Promise(function (resolve, reject) {
            kms.encrypt(params, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.CiphertextBlob);
                }
            });
        });
    };
    return KMSCrypto;
}());
exports.KMSCrypto = KMSCrypto;
