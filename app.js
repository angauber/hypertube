const express = require('express');
const request = require('request');
const fs = require('fs');
const path = require('path');
const session = require('express-session')
const GrowingFile = require('growing-file');

const torrent = require('./controller/torrent')
const movie = require('./controller/movie')
const live = require('./controller/live')

const app = express();

app.set('view engine', 'ejs');
app.use('/js', express.static('public/js'));
app.use('/srt', express.static('data/subs'));
app.use('/tvSrt', express.static('data/tvSubs'));

app.set('trust proxy', 1) // trust first proxy
app.use(session({
	secret: 'keyboard hype',
	resave: false,
	saveUninitialized: true,
}))
app.get('/', function(req, res) {
	if (req.session.token_42) {
		console.log(req.session.token_42);
		console.log(req.session.cookie.maxAge / 1000);
		res.render('home.ejs');
	} else {
		res.render('login.ejs')
	}
})
.get('/signup', function(req, res) {
	if (req.session.token_42) {
		res.render('home.ejs');
	} else {
		res.render('not_found.ejs')
	}
})
.get('/stat', function(req, res) {
	if (req.session.token_42) {
		res.render('stat.ejs');
	}
	else {
		res.render('not_found.ejs')
	}
})
.get('/42auth', function(req, res) {
	if (req.session.token_42) {
		res.render('home.ejs');
	} else {
		if (typeof req.query.code !== "undefined") {
			console.log('making reqest');
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
})
.get('/tv', function(req, res) {
	if (req.session.token_42) {
		res.render('tv.ejs')
	}
	else {
		res.render('not_found.ejs')
	}
})
.get('/query', function(req, res) {
	if (typeof req.query.name !== "undefined") {
		request('https://yts.am/api/v2/list_movies.json?sort_by=download_count&query_term=' + req.query.name + '&limit=48', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				const info = JSON.parse(body)
				if (info.data.movies) {
					res.render('search.ejs', {'data' : info.data.movies})
				}
				else {
					res.render('search.ejs', {'data' : false});
				}
			}
			else {
				res.status(404).end();
			}
		})
	}
	else {
		res.status(404).end();
	}
})
.get('/tvQuery', function(req, res) {
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
				res.status(404).end();
			}
		})
	}
	else {
		res.status(404).end();
	}
})
.get('/movie', function(req, res) {
	if (typeof req.query.id !== "undefined") {
		movie.start_movie(req.query.id, res)
	}
	else {
		res.status(404).end();
	}
})
.get('/episode', function(req, res) {
	if (typeof req.query.id !== "undefined" && typeof req.query.name !== "undefined" && typeof req.query.season !== "undefined" && typeof req.query.episode != "undefined") {
		request('https://api.themoviedb.org/3/tv/' + req.query.id + '/season/' + req.query.season + '/episode/' + req.query.episode + '?api_key=425328382852ef8b6cd2922a26662d56&language=en-US&language=en-US', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				const info = JSON.parse(body)
				if (info.episode_number !== "undefined") {
					info.name = req.query.name
					info.show_id = req.query.id
					torrent.launch_episode(res, info)
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
	else {
		res.status(404).end()
	}
})
.get('/show', function(req, res) {
	if (typeof req.query.id !== "undefined") {
		res.render('show.ejs');
	}
	else {
		res.status(404).end();
	}
})
.get('/tvPagination', function(req, res) {
	if (typeof req.query.page !== "undefined") {
		request('https://api.themoviedb.org/3/tv/popular?api_key=425328382852ef8b6cd2922a26662d56&language=en-US&page=' + req.query.page, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				const info = JSON.parse(body);
				if (info.results) {
					res.json({'data' : info.results});
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
	else {
		res.status(404).end();
	}
})
.get('/pagination', function(req, res) {
	if (typeof req.query.page !== "undefined") {
		request('https://yts.am/api/v2/list_movies.json?sort_by=download_count&page=' + req.query.page + '&limit=48', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				const info = JSON.parse(body);
				if (info.data.movies) {
					res.json({'data' : info.data.movies});
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
	else {
		res.status(404).end();
	}
})
.get('/stream', function(req, res) {
	if (typeof req.query.url !== "undefined") {
		console.log(req.query.url);
		const path = '/sgoinfre/Perso/angauber/hypertube/download/' + req.query.url
		if (!fs.existsSync(path)) {
			console.log('error files does not exists');
			res.status(404).end();
		}
		else {
			res.writeHead(200, {
				'Content-Type': 'video/mp4'
			});
			file = GrowingFile.open(path, {
				timeout: 3000,
				interval: 100,
				startFromEnd: true
			});
			file.pipe(res);
		}
	}
	else {
		res.status(404).end();
	}
})
.get('/size', function(req, res) {
	if (typeof req.query.id !== "undefined") {
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
			request('https://yts.am/api/v2/movie_details.json?movie_id=' + req.query.id, function (error, response, body) {
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
	}
})
.get('/time', function(req, res) {
	console.log('time called');
	if (typeof req.query.type !== "undefined" && typeof req.query.id !== "undefined" && typeof req.query.time !== "undefined") {
		live.register_time(req.session, req.query.type, req.query.id, req.query.time);
	}
})
.use(function(req, res, next){
	res.render('not_found.ejs')
	// res.setHeader('Content-Type', 'text/plain');
	// res.status(404).send('404 NOT FOUND !');
});

app.listen(8008);
