let mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, keepAlive: true, keepAliveInitialDelay: 10000 });

let db = mongoose.connection;

module.exports = db;
