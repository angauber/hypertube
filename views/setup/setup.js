let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/hypertube', { useNewUrlParser: true, keepAlive: true, keepAliveInitialDelay: 10000 });

let db = mongoose.connection;

module.exports = db;
