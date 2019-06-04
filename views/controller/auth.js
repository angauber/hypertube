const request = require('request');
const queryString = require('query-string');

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
									users.add({oauth: '42', id: info.id, username: info.login, img: info.image_url, language: 'en'})
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
	},
	oauth_git: function(req, res) {
		if (typeof req.query.code !== "undefined") {
			request.post({url:'https://github.com/login/oauth/access_token', form: {client_id: '065c3a7f21bf12230852', client_secret: 'e3e01e9ce63b37e86480e874b648b48ebaafe8d7', code: req.query.code, redirect_uri: 'http://localhost:8008/gitauth'}}, function(err,httpResponse,body) {
				const parsed = queryString.parse(body);

				const token = parsed.access_token
				if (typeof token !== "undefined") {
					console.log(token);
					const options = {
						uri: 'https://api.github.com/user',
						method: 'GET',
						headers: {
							'User-Agent': 'Awesome-angauber-App',
							Authorization: 'token ' + token
						}
					};
					console.log(options.headers);
					request(options, callback);
					function callback(error, response, body) {
						const info = JSON.parse(body)
						console.log(info.id)

						if (typeof info.id !== "undefined") {
							users.find({oauth: 'git', id: info.id}).then(function(result) {
								if (result.length === 0) {
									users.add({oauth: 'git', id: info.id, username: info.login, img: info.avatar_url, language: 'en'})
								}
								req.session.cookie.maxAge = parseInt(info.expires_in) * 1000
								req.session.oauth = 'git'
								req.session.user_id = info.id
								req.session.token = token

								res.redirect("/");
							})
						}
					}
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
