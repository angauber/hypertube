const mongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const manager = require('./manager');

module.exports = {
	find_movie: function(obj) {
		return new Promise(function(resolve, reject) {
			manager.connect().then(function(db) {
				const collection = db.collection('movies');
				collection.find(obj).toArray(function(err, docs) {
					assert.equal(err, null);
					resolve(docs);
				});
			})
		})
	},
	find_episode: function(obj) {
		return new Promise(function(resolve, reject) {
			manager.connect().then(function(db) {
				const collection = db.collection('episodes');
				collection.find(obj).toArray(function(err, docs) {
					assert.equal(err, null);
					resolve(docs);
				});
			})
		})
	},
	add_movie: function(id, size, path) {
		manager.connect().then(function(db) {
			const collection = db.collection('movies');
			collection.insertOne({id: id, size: size, path: path}, function(err, result) {
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
	update_movie: function(path, obj) {
		manager.connect().then(function(db) {
			const collection = db.collection('movies');
			collection.updateOne(
				{ path: path },
				{
					$set: obj
				}
			);
		})
	},
	update_episode: function(path, obj) {
		manager.connect().then(function(db) {
			const collection = db.collection('episodes');
			collection.updateOne(
				{ path: path },
				{
					$set: obj
				}
			);
		})
	},
	movie_remove: function(obj) {
		manager.connect().then(function(db) {
			const collection = db.collection('movies');
			collection.deleteMany(obj);
		})
	},
	episode_remove: function(obj) {
		manager.connect().then(function(db) {
			const collection = db.collection('episodes');
			collection.deleteMany(obj);
		})
	}
}
