const torrent = require('./torrent');
const request = require('request');

const files = require('../model/files');
const users = require('../model/users');

module.exports = {
	start_movie: function(req, res) {
		if (typeof req.session.oauth !== "undefined" && typeof req.session.user_id !== "undefined") {
			if (typeof req.query.id !== "undefined") {
				request('https://api.themoviedb.org/3/movie/' + req.query.id + '?api_key=425328382852ef8b6cd2922a26662d56&language=en-US&language=en-US', function (error, response, body) {
					if (!error && response.statusCode == 200) {
						const info = JSON.parse(body);
						if (typeof info !== "undefined") {
							users.find({oauth: req.session.oauth, id: parseInt(req.session.user_id)}).then(function(response) {
								if (typeof response[0].language !== "undefined") {
									console.log('launchinggggg');
									torrent.launch_movie(res, info, response[0].language)
								}
							})
						}
						else {
							res.render('not_found.ejs')
						}
					}
				})
			}
			else {
				res.render('not_found.ejs')
			}
		}
		else {
			res.render('login.ejs')
		}
	},
	start_episode: function(req, res) {
		if (typeof req.session.oauth !== "undefined" && typeof req.session.user_id !== "undefined") {
			if (typeof req.query.id !== "undefined" && typeof req.query.name !== "undefined" && typeof req.query.season !== "undefined" && typeof req.query.episode != "undefined") {
				request('https://api.themoviedb.org/3/tv/' + req.query.id + '/season/' + req.query.season + '/episode/' + req.query.episode + '?api_key=425328382852ef8b6cd2922a26662d56&language=en-US&language=en-US', function (error, response, body) {
					if (!error && response.statusCode == 200) {
						const info = JSON.parse(body)
						if (info.episode_number !== "undefined") {
							info.name = req.query.name
							info.show_id = req.query.id
							users.find({oauth: req.session.oauth, id: parseInt(req.session.user_id)}).then(function(response) {
								if (typeof response[0].language !== "undefined") {
									console.log('launcinggggg');
									torrent.launch_episode(res, info, response[0].language)
								}
							})
						}
						else {
							res.render('not_found.ejs')
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
		}
		else {
			res.render('login.ejs')
		}
	},
	query: function(req, res) {
		if (typeof req.query.name !== "undefined") {
			request('https://api.themoviedb.org/3/search/movie?api_key=425328382852ef8b6cd2922a26662d56&language=en-US&query=' + req.query.name, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					const info = JSON.parse(body);
					console.log(body);
					if (info.results) {
						res.render('search.ejs', {'data' : info.results})
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
	clear: function(req, res) {
		files.delall()
	},
	try: function() {
		const options = {
			uri: 'https://yts.am/api/v2/list_movies.json?query_term=Arrival',
			cloudflareTimeout: 6000
		}
		cloudscraper(options).then(function(response) {
			console.log(response);
		})
	}
}
