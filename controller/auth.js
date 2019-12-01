const request = require('request');
const queryString = require('query-string');

const users = require('../model/users');

module.exports = {
	oauth_42: function(req, res) {
		if (typeof req.query.code !== "undefined") {
			request.post({url:'https://api.intra.42.fr/oauth/token', form: {grant_type: 'authorization_code', client_id: process.env.FORTY_TWO_CLIENT_ID, client_secret: process.env.FORTY_TWO_CLIENT_SECRET, code: req.query.code, redirect_uri: 'http://localhost:8008/42auth'}}, function(err,httpResponse,body){
				const info = JSON.parse(body)
				const token = info.access_token
				if (typeof token !== "undefined") {
					request('https://api.intra.42.fr/v2/me?access_token=' + token, function (error, response, body) {
						const info = JSON.parse(body)

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
			request.post({url:'https://github.com/login/oauth/access_token', form: {client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code: req.query.code, redirect_uri: 'http://localhost:8008/gitauth'}}, function(err,httpResponse,body) {
				const parsed = queryString.parse(body);

				const token = parsed.access_token
				if (typeof token !== "undefined") {
					const options = {
						uri: 'https://api.github.com/user',
						method: 'GET',
						headers: {
							'User-Agent': 'Awesome-angauber-App',
							Authorization: 'token ' + token
						}
					};
					request(options, callback);
					function callback(error, response, body) {
						const info = JSON.parse(body)

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
