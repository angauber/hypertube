const request = require('request');

module.exports = {
	oauth_42: function(req, res) {
		if (typeof req.query.code !== "undefined") {
			request.post({url:'https://api.intra.42.fr/oauth/token', form: {grant_type: 'authorization_code', client_id: 'e4c94fbb3b0c602e87b8b6ec7065ed7d474d40adcc4b6450beb63a723d7552a4', client_secret: 'a9eee462c30eb0adfe6f9f28cd6dead2cd877582420306493aec46306ea553d2', code: req.query.code, redirect_uri: 'http://localhost:8008/42auth'}}, function(err,httpResponse,body){
				const info = JSON.parse(body)

				if (typeof info.access_token != "undefined") {
					req.session.cookie.maxAge = parseInt(info.expires_in) * 1000
					req.session.token_42 = info.access_token

					res.render('home.ejs')
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
