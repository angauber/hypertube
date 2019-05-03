const request = require('request');

module.exports = {
	register_time: function(session, type, id, time) {
		if (typeof session.token_42 != "undefined") {
			request('https://api.intra.42.fr/v2/me?access_token=' + session.token_42, function (error, response, body) {
				const info = JSON.parse(body)
				console.log(info);

				if (typeof info.id !== "undefined") {
					console.log(time)
				}
			})
		}
	}
}
