const request = require('request');
const session = require('express-session')

const auth = require('./auth');
const comments = require('../model/comments.js');
const users = require('../model/users');
const files = require('../model/files');

module.exports = {
	add_comment: function(req, res) {
		if (typeof req.session.oauth !== "undefined" && typeof req.session.user_id) {
			if (typeof req.body.message !== "undefined" && typeof req.body.id !== "undefined" && typeof req.body.type != "undefined" && (req.body.type === 'tv' || req.body.type === 'movie') && typeof req.body.message === 'string' && (req.body.message.length > 3 && req.body.message.length < 151)) {
				let d = new Date,
				dformat = [d.getDate(), d.getMonth()+1, d.getFullYear()].join('/')+' '+[d.getHours(),d.getMinutes()].join(':');
				comments.add({auth: req.session.oauth, id: req.session.user_id, type: req.body.type, code: req.body.id, message: req.body.message, time: dformat}).then(function() {
					res.send()
				})
			}
		}
	},
	get_comments: function(req, res) {
		if (typeof req.session.oauth !== "undefined" && typeof req.session.user_id !== "undefined" && typeof req.body.id !== "undefined" && typeof req.body.type != "undefined") {
			comments.find({type: req.body.type, code: req.body.id}).then(function(result) {
				if (result[0]) {
					let promises = [];
					let promise
					let obj = []
					let j = 0;
					for (let i = 0; i < result.length; i++) {
						promise = users.find({oauth: result[i].auth, id: result[i].id}).then(function(user) {
							if (typeof user[0] !== "undefined") {
								obj[j] = {};
								obj[j].sort = i
								obj[j].oauth = result[i].auth
								obj[j].user_id = result[i].id
								obj[j].message = result[i].message
								obj[j].time = result[i].time
								obj[j].username = user[0].username
								obj[j].img = user[0].img
								j++
							}
						})
						promises.push(promise)
					}
					Promise.all(promises).then(function() {
						obj.sortOn("sort")
						res.json(obj)
					})
				}
				else {
					res.json('[]')
				}
			})
		}
		else {
			res.json('[]')
		}
	}
}

Array.prototype.sortOn = function(key){
	this.sort(function(a, b){
		if(a[key] < b[key]){
			return -1;
		}else if(a[key] > b[key]){
			return 1;
		}
		return 0;
	});
}
