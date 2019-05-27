const request = require('request');
const fs = require('fs');
const pump = require('pump');
const ffmpeg = require('fluent-ffmpeg');
const growingFile = require('growing-file');
const torrent = require('./torrent');
const users = require('../model/users');

const tailing = require('tailing-stream');

const stat = require('../model/stat');
const files = require('../model/files')

module.exports = {
	register_time: function(session, type, id, time) {
		if ((type == 'tv' || type == 'movie') && parseInt(time) > 0) {
			if (typeof session.oauth !== "undefined" && typeof session.user_id !== "undefined") {
				obj = {auth: session.oauth, id: session.user_id, type: type, code: id, time: time};
				stat.find(obj).then(function(res) {
					if (!res.auth) {
						stat.add(obj)
					}
				})
			}
		}
	},
	pagination: function(req, res) {
		let order;
		switch (req.query.order) {
			case 'Rating':
				order = 'rating';
				break;
			case 'Year':
				order = 'year';
				break;
			case 'Alphabetical':
				order = 'title';
				break;
			default:
				order = 'download_count';
		}
		console.log(order);
		console.log(req.query.genre);
		console.log(req.query.page);
		request('http://ytss.unblocked.is/api/v2/list_movies.json?sort_by=' + order + '&genre=' + req.query.genre.toLowerCase() + '&page=' + req.query.page + '&limit=48', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				const info = JSON.parse(body);
				if (info.data.movies) {
					res.json({data: info.data.movies})
				}
				else {
					res.json(false)
				}
			}
			else {
				res.json(false)
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
		const path = '/sgoinfre/Perso/angauber/hypertube/download/' + req.query.url
		if (!fs.existsSync(path)) {
			console.log(path);
			console.log('error files does not exists');
		}
		else {
			let split = req.query.url.split(".")
			let ext = split[split.length - 1]
			if (ext == "mkv") {
				console.log('matrsifdb');
				const stream = growingFile.open(path)

				let conversion = ffmpeg(stream)
				.withVideoCodec("libvpx")
				.withVideoBitrate("1500")
				.withAudioCodec("libvorbis")
				.withAudioBitrate("256k")
				.audioChannels(2)
				.outputOptions([
					"-preset ultrafast",
					"-deadline realtime",
					"-error-resilient 1",
					"-movflags +faststart",
				])
				.format("matroska")
				const head = {
					'Content-Type': 'video/webm',
				}
				res.writeHead(200, head)
				pump(conversion, res);
			}
			else {
				download_finished(req.query.url).then(function(finished) {
					if (finished) {
						const range = req.headers.range
						const stat = fs.statSync(path)
						const fileSize = stat.size
						if (range) {
							const parts = range.replace(/bytes=/, "").split("-")
							const start = parseInt(parts[0], 10)
							const end = parts[1]
							? parseInt(parts[1], 10)
							: fileSize - 1
							const chunksize = (end-start) + 1
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
						console.log('mpifour');
						const stream = growingFile.open(path)
						const head = {
							'Content-Type': 'video/mp4',
						}
						res.writeHead(200, head)
						stream.pipe(res);
					}
				})
			}
		}
	},
	size: function(req, res) {
		if (typeof req.query.tv !== "undefined") {
			torrent.episode_exists(parseInt(req.query.id), function(ep) {
				let path = ep.path
				let size = ep.size
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
					res.json(false)
				}
			})
		}
		else {
			request('http://ytss.unblocked.is/api/v2/movie_details.json?movie_id=' + req.query.id, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					const info = JSON.parse(body);
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
		if (typeof req.session.oauth !== "undefined" && typeof req.session.user_id !== "undefined") {
			users.find({oauth: req.session.oauth, id: req.session.user_id}).then(function(result) {
				let obj = result[0]
				stat.find({auth: req.session.oauth, id: req.session.user_id}).then(function(result) {
					// for (let i = 0; i < result.length; i++) {
					// 	if (result[i].type == "movie") {
					// 		cloudscraper.get('https://yts.am/api/v2/movie_details.json?movie_id=' + result[i].code).then(function(response) {
					// 			const info = JSON.parse(response);
					// 			if (info.data.movie) {
					// 				console.log(info.data.movie);
					// 			}
					// 			else {
					// 				res.json(false)
					// 			}
					// 		})
					// 	}
					// 	else {
					//
					// 	}
					// }
					obj.history = result;
					res.json(JSON.stringify(obj))
				})
			})
		}
		else {
			res.json(false)
		}
	},
	user: function(req, res) {
		if (typeof req.session.oauth !== "undefined" && typeof req.session.user_id !== "undefined") {
			if (typeof req.query.type !== "undefined" && typeof req.query.id !== "undefined") {
				users.find({oauth: req.query.type, id: parseInt(req.query.id)}).then(function(result) {
					if (result[0]) {
						const obj = result[0]
						console.log(obj)
						stat.find({auth: req.query.type, id: parseInt(req.query.id)}).then(function(result) {
							console.log(result)
							if (result) {
								obj.history = result
								res.json(JSON.stringify(obj))
							}
							else {
								res.json(false)
							}
						})
					}
					else {
						res.json(false)
					}
				})
			}
			else {
				res.json(false)
			}
		}
		else {
			res.josn(false)
		}
	},
	change_language: function(req, res) {
		if (typeof req.session.oauth !== "undefined" && typeof req.session.user_id !== "undefined") {
			if (typeof req.body.language !== "undefined" && (req.body.language === "en" || req.body.language === "fr" || req.body.language === "es" || req.body.language === "de")) {
				users.update(req.session.oauth, req.session.user_id, {language: req.body.language})
			}
		}
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
