const mongoClient = require('mongodb').MongoClient;
const assert = require('assert');

module.exports = {
	find: function(obj) {
		return new Promise(function(resolve, reject) {
			connect().then(function(db) {
				const collection = db.collection('stats');
				collection.find(obj).toArray(function(err, docs) {
					assert.equal(err, null);
					resolve(docs);
				});

			})
		})
	},
	add: function(obj) {
		connect().then(function(db) {
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
		connect().then(function(db) {
			const collection = db.collection('stats');
			collection.deleteMany(obj, function(err, result) {
				console.log("Removed the document(s)");
			});
		})
	}
}

let connect = function() {
	return new Promise(function(resolve, reject) {

		const url = 'mongodb://localhost:27017';
		const dbName = 'hypertube';

		mongoClient.connect(url, {useNewUrlParser: true }, function(err, client) {
			assert.equal(null, err);
			console.log("Connected successfully to server");

			resolve(client.db(dbName));
		})
	})
}
