const express = require('express');
const request = require('request');
const fs = require('fs');
const path = require('path');
const GrowingFile = require('growing-file');
const torrent = require('./torrent');
const app = express();

app.set('view engine', 'ejs');
app.use('/js', express.static('public/js'));
app.use('/srt', express.static('data/subs'));
app.use('/tvSrt', express.static('data/tvSubs'));

app.get('/', function(req, res) {
	res.render('home.ejs');
})
.get('/42auth', function(req, res) {
	if (typeof req.query.code !== "undefined") {
		console.log('making reqest');
		console.log(request.post('https://api.intra.42.fr/oauth/token').form({grand_type: 'client_credentials', client_id: '31d8a3dc762efc192b63a8877cd71ff77a004d348da9e2d92497c806e272c374', client_secret: '8fc87ed6fb9bfd4f623496efdaad63fb87bc473486c24e9a5d03d2a138de1c54', code: req.query.code}));
		console.log('request post');
	}
	else {
		res.status(404).end();
	}
})
.get('/tv', function(req, res) {
	res.render('tv.ejs')
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
		request('https://yts.am/api/v2/movie_details.json?movie_id=' + req.query.id, function (error, response, body) {
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
		const path = '/sgoinfre/Perso/angauber/hypertube/download/' + req.query.url.replace(' ', '+')
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
.use(function(req, res, next){
	res.setHeader('Content-Type', 'text/plain');
	res.status(404).send('404 NOT FOUND !');
});

app.listen(8008);
