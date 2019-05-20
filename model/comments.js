const mongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const manager = require('./manager');

module.exports = {
	find: function(obj) {
		return new Promise(function(resolve, reject) {
			manager.connect().then(function(db) {
				const collection = db.collection('comments');
				collection.find(obj).sort({'_id': -1}).toArray(function(err, docs) {
					assert.equal(err, null);
					resolve(docs);
				});
			})
		})
	},
	add: function(obj) {
		return new Promise(function(resolve, reject) {
			manager.connect().then(function(db) {
				const collection = db.collection('comments');
				collection.insertOne(obj, function(err, result) {
					console.log("Inserted documents into the `comments` collection")
					resolve()
				});
			})
		})
	}
}
