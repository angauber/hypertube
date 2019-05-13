const request = require('request');
const cloudscraper = require('cloudscraper');
const fs = require('fs');
const growingFile = require('growing-file');
const torrent = require('./torrent')

const stat = require('../model/stat');

module.exports = {
	register_time: function(session, type, id, time) {
		stat.find({}).then(function(res) {
			console.log(res);
		})
		if ((type == 'tv' || type == 'movie') && parseInt(time) > 0) {
			if (typeof session.token_42 != "undefined") {
				request('https://api.intra.42.fr/v2/me?access_token=' + session.token_42, function (error, response, body) {
					const info = JSON.parse(body)
					if (typeof info.id !== "undefined") {
						console.log('42' + ' ' + info.id + ' ' + type + ' ' + id + ' ' + time)
						obj = {auth: '42', id: info.id, type: type, code: id, time: time};
						stat.find(obj).then(function(res) {
							console.log(res);
							if (!res.auth) {
								stat.add(obj)
							}
						})
					}
				})
			}
		}
	},
	pagination: function(req, res) {
		cloudscraper.get('https://yts.am/api/v2/list_movies.json?sort_by=download_count&page=' + req.query.page + '&limit=48').then(function(response) {
			// console.log(response);
			const info = JSON.parse(response);
			if (info.data.movies) {
				res.json({'data' : info.data.movies});
			}
			else {
				res.render('not_found.ejs')
			}
		})
	},
	tv_pagination: function(req, res) {
		request('https://api.themoviedb.org/3/tv/popular?api_key=425328382852ef8b6cd2922a26662d56&language=en-US&page=' + req.query.page, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				const info = JSON.parse(body);
				if (info.results) {
					res.json({'data' : info.results});
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
	stream: function(req, res) {
		console.log(req.query.url);
		const path = '/sgoinfre/Perso/angauber/hypertube/download/' + req.query.url
		if (!fs.existsSync(path)) {
			console.log('error files does not exists');
			res.render('not_found.ejs')
		}
		else {
			res.writeHead(200, {
				'Content-Type': 'video/mp4'
			});
			file = growingFile.open(path, {
				timeout: 3000,
				interval: 100,
				startFromEnd: true
			});
			file.pipe(res);
		}
	},
	size: function(req, res) {
		if (typeof req.query.tv !== "undefined") {
			torrent.episode_exists(req.query.id, function(path, size) {
				if (path !== "undefined" && size !== "undefined") {
					const file = '/sgoinfre/Perso/angauber/hypertube/download/' + path
					if (!fs.existsSync(file)) {
						res.json(false)
					}
					else {
						const torrentPSize = size / 100
						const stats = fs.statSync(file)
						const fileSize = stats.size
						if (fileSize > torrentPSize) {
							res.json('100')
						}
						else {
							res.json((Math.floor((100 * fileSize / torrentPSize))).toString())
						}
					}
				}
				else {
					console.log('path/size is null in episodes.json');
					res.json(false)
				}
			})
		}
		else {
			request('https://yts.am/api/v2/movie_details.json?movie_id=' + req.query.id, function (error, response, body) { // better keep track of the size in the db to fetch it now..
				if (!error && response.statusCode == 200 && body) {
					const info = JSON.parse(body);
					if (info.data.movie) {
						torrent.movie_exists(info.data.movie.imdb_code, function(path) {
							if (path) {
								const file = '/sgoinfre/Perso/angauber/hypertube/download/' + path
								if (!fs.existsSync(file)) {
									res.json(false)
								}
								else {
									const torrentPSize = torrent.get_best_torrent(info.data.movie.torrents).size_bytes / 100
									const stats = fs.statSync(file)
									const fileSize = stats.size
									if (fileSize > torrentPSize) {
										res.json('100')
									}
									else {
										res.json((Math.floor((100 * fileSize / torrentPSize))).toString())
									}
								}
							}
							else {
								console.log('path is null');
								res.json(false)
							}
						})
					}
					else {
						res.json(false);
					}
				}
				else {
					res.json(false);
				}
			})
		}
	},
	user_stats: function(req, res) {
		if (typeof req.session.token_42 != "undefined") {
			request('https://api.intra.42.fr/v2/me?access_token=' + req.session.token_42, function (error, response, body) {
				const info = JSON.parse(body)
				if (typeof info.id !== "undefined") {
					let obj = {};

					obj.id = info.id
					obj.login = info.login
					obj.name = info.displayname
					obj.img = info.image_url
					stat.find({auth: '42', id: info.id}).then(function(result) {
						obj.history = result;
						res.json(JSON.stringify(obj))
					})
					// stat.remove({auth: '42', id: info.id})
				}
			})
		}
		else {
			res.json(false)
		}
	}
}
