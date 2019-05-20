const request = require('request');
const users = require('../model/users');

module.exports = {
	oauth_42: function(req, res) {
		if (typeof req.query.code !== "undefined") {
			request.post({url:'https://api.intra.42.fr/oauth/token', form: {grant_type: 'authorization_code', client_id: 'e4c94fbb3b0c602e87b8b6ec7065ed7d474d40adcc4b6450beb63a723d7552a4', client_secret: 'a9eee462c30eb0adfe6f9f28cd6dead2cd877582420306493aec46306ea553d2', code: req.query.code, redirect_uri: 'http://localhost:8008/42auth'}}, function(err,httpResponse,body){
				const info = JSON.parse(body)
				const token = info.access_token
				if (typeof token !== "undefined") {
					request('https://api.intra.42.fr/v2/me?access_token=' + token, function (error, response, body) {
						const info = JSON.parse(body)
						console.log(info.id)

						if (typeof info.id !== "undefined") {
							users.find({oauth: '42', id: info.id}).then(function(result) {
								if (result.length === 0) {
									users.add({oauth: '42', id: info.id, username: info.login, img: info.image_url})
								}
								req.session.cookie.maxAge = parseInt(info.expires_in) * 1000
								req.session.oauth = '42'
								req.session.user_id = info.id
								req.session.token = token

								res.redirect("/");
							})
						}
					})
				}
				else {
					res.render('login.ejs')
				}
			})
		}
		else {
			res.render('login.ejs')
		}
	}
}
