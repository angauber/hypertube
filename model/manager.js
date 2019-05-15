const mongoClient = require('mongodb').MongoClient;
const assert = require('assert');

module.exports = {
	connect: function() {
		return new Promise(function(resolve, reject) {

			const url = 'mongodb://localhost:27017';
			const dbName = 'hypertube';

			mongoClient.connect(url, {useNewUrlParser: true }, function(err, client) {
				assert.equal(null, err);
				resolve(client.db(dbName));
			})
		})
	}
}
