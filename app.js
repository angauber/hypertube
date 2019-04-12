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

app.get('/', function(req, res) {
	res.render('home.ejs');
})
.get('/query', function(req, res) {
	if (req.query.name !== undefined) {
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
.get('/movie', function(req, res) {
	if (req.query.id !== undefined) {
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
.get('/pagination', function(req, res) {
	if (req.query.page !== undefined) {
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
	if (req.query.url !== undefined) {
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
	if (req.query.id !== undefined) {
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
})
.use(function(req, res, next){
	res.setHeader('Content-Type', 'text/plain');
	res.status(404).send('404 NOT FOUND !');
});

app.listen(8008);
