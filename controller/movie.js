const cloudscraper = require('cloudscraper');
const torrent = require('./torrent');
const request = require('request');

const files = require('../model/files');

module.exports = {
	start_movie: function(id, res) {
		cloudscraper.get('https://yts.am/api/v2/movie_details.json?movie_id=' + id).then(function(response) {
			const info = JSON.parse(response);
			if (info.data.movie) {
				torrent.launch_movie(res, info.data.movie)
			}
			else {
				res.render('not_found.ejs')
			}
		})
	},
	start_episode: function(req, res) {
		request('https://api.themoviedb.org/3/tv/' + req.query.id + '/season/' + req.query.season + '/episode/' + req.query.episode + '?api_key=425328382852ef8b6cd2922a26662d56&language=en-US&language=en-US', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				const info = JSON.parse(body)
				if (info.episode_number !== "undefined") {
					info.name = req.query.name
					info.show_id = req.query.id
					torrent.launch_episode(res, info)
				}
				else {
					res.render('not_found.ejs')
				}
			}
			else {
				res.render('not_found.ejs')
			}
		})
	},
	query: function(req, res) {
		if (typeof req.query.name !== "undefined") {
			cloudscraper.get('https://yts.am/api/v2/list_movies.json?sort_by=download_count&query_term=' + req.query.name + '&limit=48').then(function(response) {
				const info = JSON.parse(response)
				if (info.data.movies) {
					res.render('search.ejs', {'data' : info.data.movies})
				}
				else {
					res.render('not_found.ejs')
				}
			})
		}
		else {
			res.render('not_found.ejs')
		}
	},
	tv_query: function (req, res) {
		if (typeof req.query.name !== "undefined") {
			request('https://api.themoviedb.org/3/search/tv?api_key=425328382852ef8b6cd2922a26662d56&language=en-US&query=' + req.query.name, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					const info = JSON.parse(body);

					console.log(body);
					if (info.results) {
						res.render('tvSearch.ejs', {'data' : info.results})
					}
					else {
						res.render('search.ejs', {'data' : false});
					}
				}
				else {
					res.render('not_found.ejs')
				}
			})
		}
		else {
			res.render('not_found.ejs')
		}
	},
	clear: function (req, res) {
		files.delall()
	}
}
