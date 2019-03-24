const mongodb = require('mongodb');

const uri = 'mongodb://sa:Leo832232*@ds141889.mlab.com:41889/line';

module.exports.signup = function (userObj, callback) {
    mongodb.MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
        if(err) throw err;
        let db = client.db('line')
        let user = db.collection('user');
        user.find({ userId : { $eq: userObj.userId } }).toArray(function (err, list) {
            if(list.length == 0) {
                user.insert(userObj, function(err, result) {
                    callback(true);
                });
            }
            else {
                callback(false);
            }
            client.close();
        });
    });    
}

module.exports.accountCheck = function (userId, callback) {
    mongodb.MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
        if(err) throw err;
        let db = client.db('line')
        let user = db.collection('user');
        user.find({ userId : { $eq: userId } }).toArray(function (err, list) {
            if(list.length == 0) callback(false);
            else callback(true);
            client.close();
        });
    });
}

module.exports.getLocation = function (userId, callback) {
    mongodb.MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
        if(err) throw err;
        let db = client.db('line')
        let user = db.collection('user');
        user.find({ userId : { $eq: userId } }).toArray(function (err, list) {
            callback(list[0].location);
            client.close();
        });
    });
}

module.exports.delete = function (userId, callback) {
    mongodb.MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
        if(err) throw err;
        let db = client.db('line')
        let user = db.collection('user');
        user.find({ userId : { $eq: userId } }).toArray(function (err, list) {
            user.deleteOne(list[0], function(err, client) {
                callback("已刪除帳號 歡迎再次使用~~~");
            });
            client.close();
        });
    });
}