const request = require('request');

const torrent = require('./torrent');

module.exports = {
	start_movie: function(id, res) {
		request('https://yts.am/api/v2/movie_details.json?movie_id=' + id, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				const info = JSON.parse(body);
				if (info.data.movie) {
					torrent.launch_movie(res, info.data.movie)
				}
				else {
					res.status(404).end();
				}
			}
			else {
				res.status(404).end();
			}
		})
	}
}
