const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')

const torrent = require('./controller/torrent')
const auth = require('./controller/auth')
const movie = require('./controller/movie')
const live = require('./controller/live')
const comment = require('./controller/comment')

const request = require('request')

const app = express();

let formRouter = require('./routes/form');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/js', express.static('public/js'));
app.use('/srt', express.static('data/subs'));
app.use('/tvSrt', express.static('data/tvSubs'));
app.use('/form/', formRouter);

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
		res.render('register.ejs')
	}
})
.get('/stats', function(req, res) {
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
		auth.oauth_42(req, res)
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
	if (req.session.token_42) {
		movie.query(req, res)
	}
	else {
		res.render('not_found.ejs')
	}
})
.get('/tvQuery', function(req, res) {
	if (req.session.token_42) {
		movie.tv_query(req, res)
	}
	else {
		res.render('not_found.ejs')
	}
})
.get('/movie', function(req, res) {
	if (typeof req.query.id !== "undefined") {
		movie.start_movie(req.query.id, res)
	}
	else {
		res.render('not_found.ejs')
	}
})
.get('/episode', function(req, res) {
	if (typeof req.query.id !== "undefined" && typeof req.query.name !== "undefined" && typeof req.query.season !== "undefined" && typeof req.query.episode != "undefined") {
		movie.start_episode(req, res)
	}
	else {
		res.render('not_found.ejs')
	}
})
.get('/show', function(req, res) {
	if (typeof req.query.id !== "undefined") {
		res.render('show.ejs');
	}
	else {
		res.render('not_found.ejs')
	}
})
.get('/tvPagination', function(req, res) {
	if (typeof req.query.page !== "undefined") {
		live.tv_pagination(req, res)
	}
	else {
		res.render('not_found.ejs')
	}
})
.get('/pagination', function(req, res) {
	if (typeof req.query.page !== "undefined") {
		live.pagination(req, res)
	}
	else {
		res.render('not_found.ejs')
	}
})
.get('/tryme', function(req, res) {
	request('https://yts.am/api/v2/list_movies.json?sort_by=download_count&page=1', function (error, response, body) {
		console.log(response);
	})
})
.get('/stream', function(req, res) {
	if (typeof req.query.url !== "undefined") {
		live.stream(req, res)
	}
	else {
		res.render('not_found.ejs')
	}
})
.get('/size', function(req, res) {
	if (typeof req.query.id !== "undefined") {
		live.size(req, res)
	}
	else {
		res.render('not_found.ejs')
	}
})
.get('/time', function(req, res) {
	if (typeof req.query.type !== "undefined" && typeof req.query.id !== "undefined" && typeof req.query.time !== "undefined") {
		live.register_time(req.session, req.query.type, req.query.id, req.query.time);
	}
	else {
		res.render('not_found.ejs')
	}
})
.post('/comments', function(req, res) {
	comment.get_comments(req, res)
})
// post request
.post("/comment", function(req) {
	comment.add_comment(req)
})
.get('/getUserStats', function(req, res) {
	live.user_stats(req, res);
})
// production tests
.get('/wipe', function(req, res) {
	movie.clear();
})
.get('/bitch', function(req, res) {
	movie.try()
})
.use(function(req, res, next){
	res.render('not_found.ejs')
	// res.setHeader('Content-Type', 'text/plain');
	// res.status(404).send('404 NOT FOUND !');
});

app.listen(8008);
