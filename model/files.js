const mongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const manager = require('./manager');

module.exports = {
	find_movie: function(id) {
		return new Promise(function(resolve, reject) {
			manager.connect().then(function(db) {
				const collection = db.collection('movies');
				collection.find({imdb: id}).toArray(function(err, docs) {
					assert.equal(err, null);
					resolve(docs);
				});
			})
		})
	},
	find_episode: function(id) {
		return new Promise(function(resolve, reject) {
			manager.connect().then(function(db) {
				const collection = db.collection('episodes');
				collection.find({id: id}).toArray(function(err, docs) {
					assert.equal(err, null);
					resolve(docs);
				});
			})
		})
	},
	add_movie: function(id, size, path) {
		manager.connect().then(function(db) {
			const collection = db.collection('movies');
			collection.insertOne({imdb: id, size: size, path: path}, function(err, result) {
			});
		})
	},
	add_episode: function(id, size, path) {
		manager.connect().then(function(db) {
			const collection = db.collection('episodes');
			collection.insertOne({id: id, size: size, path: path}, function(err, result) {
			});
		})
	},
	delall: function() {
		manager.connect().then(function(db) {
			const collection1 = db.collection('movies');
			const collection2 = db.collection('episodes');
			collection1.deleteMany()
			collection2.deleteMany()
		})
	}
}
