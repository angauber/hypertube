const express = require('express');
const request = require('request');
const app = express();

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	request('https://yts.am/api/v2/list_movies.json?sort_by=download_count&limit=50', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			const info = JSON.parse(body);
			if (info.data.movies) {
				res.render('home.ejs', {'data' : info.data.movies});
			}
		}
	})
})
.get('/query', function(req, res) {
	if (req.query.name !== undefined) {
		request('https://yts.am/api/v2/list_movies.json?sort_by=download_count&query_term=' + req.query.name + '&limit=50', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				const info = JSON.parse(body);
				if (info.data.movies) {
					res.render('home.ejs', {'data' : info.data.movies});
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
.get('/movie', function(req, res) {
	if (req.query.id !== undefined) {
		request('https://yts.am/api/v2/movie_details.json?movie_id=' + req.query.id, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				const info = JSON.parse(body);
				if (info.data.movie) {
					res.render('movie.ejs', {'data' : info.data.movie});
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
.use(function(req, res, next){
	res.setHeader('Content-Type', 'text/plain');
	res.status(404).send('404 NOT FOUND !');
});

app.listen(8080);
