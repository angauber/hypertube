const request = require('request');
const cloudscraper = require('cloudscraper');
const fs = require('fs');
const growingFile = require('growing-file');
const torrent = require('./torrent');
const users = require('../model/users');

const tailing = require('tailing-stream');

const stat = require('../model/stat');
const files = require('../model/files')

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
		}
		else {
			download_finished(req.query.url).then(function(finished) {
				console.log(finished);
				let split = req.query.url.split(".")
				let ext = split[split.length - 1]
				if (finished) {
					const range = req.headers.range
					const stat = fs.statSync(path)
					const fileSize = stat.size
					if (range) {
						const parts = range.replace(/bytes=/, "").split("-")
						const start = parseInt(parts[0], 10)
						const end = parts[1]
						? parseInt(parts[1], 10)
						: fileSize-1
						const chunksize = (end-start)+1
						const file = fs.createReadStream(path, {start, end})
						const head = {
							'Content-Range': `bytes ${start}-${end}/${fileSize}`,
							'Accept-Ranges': 'bytes',
							'Content-Length': chunksize,
							'Content-Type': 'video/mp4',
						}
						res.writeHead(206, head);
						file.pipe(res);
					} else {
						const head = {
							'Content-Type': 'video/mp4',
						}
						res.writeHead(200, head)
						fs.createReadStream(path).pipe(res)
					}
				}
				else {
					// if (ext == "mp4") {
						res.writeHead(200, {
							'Content-Type': 'video/mp4'
						});
						const stream = growingFile.open(path)
						stream.pipe(res)
					// }
					// else {
					// 	console.log('plzzzz');
					// 	res.writeHead(206, { 'Content-Type': 'video/mp4' });
					// 	const stream = growingFile.open(path)
					// 	Transcoder = require('stream-transcoder');
					//
					// 	new Transcoder(stream)
					// 	.videoCodec('h264')
					// 	.format('mp4')
					// 	.on('finish', function() {
					// 		next();
					// 	})
					// 	.stream().pipe(res);
					// }
				}
			})
		}
	},
	size: function(req, res) {
		if (typeof req.query.tv !== "undefined") {
			console.log(req.query.id);
			torrent.episode_exists(parseInt(req.query.id), function(ep) {
				console.log(ep);
				let path = ep.path
				let size = ep.size
				if (path !== "undefined" && size !== "undefined") {
					const file = '/sgoinfre/Perso/angauber/hypertube/download/' + path
					if (!fs.existsSync(file)) {
						console.log(path);
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
					console.log('path/size is null in episodes db');
					res.json(false)
				}
			})
		}
		else {
			cloudscraper.get('https://yts.am/api/v2/movie_details.json?movie_id=' + req.query.id).then(function(response) {
				const info = JSON.parse(response);
				if (info.data.movie) {
					torrent.movie_exists(info.data.movie.imdb_code, function(mv) {
						let path = mv.path
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
					console.log(info);
					res.json(false);
				}
			})
		}
	},
	user_stats: function(req, res) {
		console.log('entering stats');
		console.log(req.session.oauth);
		console.log(req.session.user_id);
		users.find({oauth: req.session.oauth, id: req.session.user_id}).then(function(result) {
			const obj = result[0]
			console.log(obj);
			stat.find({auth: req.session.oauth, id: req.session.user_id}).then(function(result) {
				console.log(result);
				for (let i = 0; i < result.length; i++) {
					if (result[i].type == "movie") {
						cloudscraper.get('https://yts.am/api/v2/movie_details.json?movie_id=' + result[i].code).then(function(response) {
							const info = JSON.parse(response);
							if (info.data.movie) {
								console.log(info.data.movie);
							}
							else {
								res.json(false)
							}
						})
					}
					else {

					}
				}
				obj.history = result;
				res.json(JSON.stringify(obj))
			})
		})
	}
}

let download_finished = function(path) {
	return new Promise(function(resolve, reject) {
		files.find_movie({path: path}).then(function(res) {
			if (typeof res[0] !== "undefined") {
				console.log(res[0]);
				if (res[0].downloaded === true) {
					resolve(true);
				}
				else {
					resolve(false);
				}
			}
			else {
				files.find_episode({path: path}).then(function(res) {
					if (typeof res[0] !== "undefined") {
						console.log(res[0]);
						if (res[0].downloaded == true) {
							resolve(true);
						}
						else {
							resolve(false);
						}
					}
					else {
						resolve(false);
					}
				})
			}
		})
	})

}
