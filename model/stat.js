const mongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const manager = require('./manager');

module.exports = {
	find: function(obj) {
		return new Promise(function(resolve, reject) {
			manager.connect().then(function(db) {
				const collection = db.collection('stats');
				collection.find(obj).toArray(function(err, docs) {
					assert.equal(err, null);
					resolve(docs);
				});

			})
		})
	},
	add: function(obj) {
		manager.connect().then(function(db) {
			const collection = db.collection('stats');
			collection.insertOne(obj, function(err, result) {
				console.log("Inserted documents into the `stats` collection");
			});
		})
	},
	update: function(oldObj, newTime) {
		//update time ?
	},
	remove: function(obj) {
		manager.connect().then(function(db) {
			const collection = db.collection('stats');
			collection.deleteMany(obj, function(err, result) {
				console.log("Removed the document(s)");
			});
		})
	}
}
