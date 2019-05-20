const request = require('request');
const session = require('express-session')

const auth = require('./auth');
const comments = require('../model/comments.js');

module.exports = {
	add_comment: function(req) {
		console.log('adding comments..');
		if (typeof req.body.message !== "undefined" && typeof req.body.id !== "undefined" && typeof req.body.type != "undefined" && (req.body.type === 'tv' || req.body.type === 'movie') && typeof req.body.message === 'string' && (req.body.message.length > 3 && req.body.message.length < 151)) {
			if (typeof req.session.token_42 !== "undefined") {
				request('https://api.intra.42.fr/v2/me?access_token=' + req.session.token_42, function (error, response, body) {
					const info = JSON.parse(body)
					if (typeof info.id !== "undefined") {
						console.log('ppooouey');
						let d = new Date,
						dformat = [d.getDate(), d.getMonth()+1, d.getFullYear()].join('/')+' '+[d.getHours(),d.getMinutes()].join(':');
						comments.add({auth: '42', id: info.id, type: req.body.type, code: req.body.id, message: req.body.message, time: dformat})
					}
				})
			}
		}
	},
	get_comments: function(req, res) {
		if (typeof req.body.id !== "undefined" && typeof req.body.type != "undefined") {
			comments.find({type: req.body.type, code: req.body.id}).then(function(result) {
				console.log(result);
				let obj = []
				for (let i = 0; i < result.length; i++) {
					let fourtytwo = false;
					if (result[i].auth === '42') {
						if (!fourtytwo) {
							auth.get_42_token().then(function(token) {
								fourtytwo = token
								get_42_info(fourtytwo, result[i]).then(function(part) {
									obj.push(part);
								})
							})
						}
						else {
							get_42_info(fourtytwo, result[i]).then(function(part) {
								obj.push(part);
							})
						}
					}
				}
				let timeout = setInterval(function()
				{ if(obj.length == result.length) { clearInterval(timeout); res.json(obj); console.log(obj);} }, 50);
			})
		}
		else {
			res.json('[]');
		}
	}
}

function get_42_info(token, user) {
	return new Promise(function(resolve, reject) {
		request('https://api.intra.42.fr/v2/users/' + user.id + '?access_token=' + token, function(error, response, body) {
			const info = JSON.parse(body)
			if (typeof info.id !== "undefined") {
				resolve({type: '42', id: user.id, username: info.login, img: info.image_url, message: user.message, time: user.time})
			}
			else {
				resolve({})
			}
		})
	})
}
