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

const Db = require('./setup/setup.js');

app.use(session({
	secret: 'keyboard hype',
	resave: false,
	saveUninitialized: true,
}))

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/img', express.static('public/img'));
app.use('/js', express.static('public/js'));
app.use('/srt', express.static('data/subs'));
app.use('/tvSrt', express.static('data/tvSubs'));
app.use('/npm', express.static('node_modules'));
app.use('/form/', formRouter);

app.set('trust proxy', 1) // trust first proxy


app.get('/', function(req, res) {
	if (req.session.user_id) {
		res.render('home.ejs');
	} else {
		res.render('login.ejs')
	}
})
.get('/signup', function(req, res) {
	if (req.session.user_id) {
		res.render('home.ejs');
	} else {
		res.render('register.ejs')
	}
})
.get('/forget-password', function(req, res) {
	if (req.session.user_id) {
		res.render('home.ejs');
	} else {
		res.render('forget_password.ejs')
	}
})
.get('/stats', function(req, res) {
	if (req.session.user_id) {
		res.render('stat.ejs');
	}
	else {
		res.render('login.ejs')
	}
})
.get('/user', function(req, res) {
	if (req.session.user_id) {
		res.render('profile.ejs');
	}
	else {
		res.render('login.ejs')
	}
})
.get('/42auth', function(req, res) {
	if (req.session.user_id) {
		res.render('home.ejs');
	} else {
		auth.oauth_42(req, res)
	}
})
.get('/gitauth', function(req, res) {
	if (req.session.user_id) {
		res.render('home.ejs');
	} else {
		auth.oauth_git(req, res)
	}
})
.get('/tv', function(req, res) {
	if (req.session.user_id) {
		res.render('tv.ejs')
	}
	else {
		res.render('login.ejs')
	}
})
.get('/query', function(req, res) {
	if (req.session.user_id) {
		movie.query(req, res)
	}
	else {
		res.render('login.ejs')
	}
})
.get('/tvQuery', function(req, res) {
	if (req.session.user_id) {
		movie.tv_query(req, res)
	}
	else {
		res.render('login.ejs')
	}
})
.get('/movie', function(req, res) {
	if (req.session.user_id) {
		movie.start_movie(req, res)
	} else {
		res.render('login.ejs')
	}
})
.get('/episode', function(req, res) {
	if (req.session.user_id) {
		movie.start_episode(req, res)
	}
	else {
		res.render('login.ejs')
	}
})
.get('/show', function(req, res) {
	if (req.session.user_id) {
		if (typeof req.query.id !== "undefined") {
			res.render('show.ejs');
		}
		else {
			res.render('not_found.ejs')
		}
	}
	else {
		res.render('login.ejs')
	}
})
.get('/tvPagination', function(req, res) {
	if (req.session.user_id) {
		if (typeof req.query.page !== "undefined") {
			live.tv_pagination(req, res)
		}
		else {
			res.render('not_found.ejs')
		}
	}
	else {
		res.render('login.ejs')
	}
})
.get('/pagination', function(req, res) {
	if (req.session.user_id && typeof req.query.page !== "undefined" && req.query.order !== "undefined" && req.query.genre !== "undefined") {
		live.pagination(req, res)
	}
	else {
		res.json(false)
	}
})
.get('/stream', function(req, res) {
	if (req.session.user_id) {
		if (typeof req.query.url !== "undefined") {
			live.stream(req, res)
		}
		else {
			res.render('not_found.ejs')
		}
	}
	else {
		res.render('login.ejs')
	}
})
.get('/size', function(req, res) {
	if (typeof req.query.id !== "undefined" && req.session.user_id) {
		live.size(req, res)
	}
	else {
		res.json(false)
	}
})
.get('/time', function(req, res) {
	if (req.session.user_id) {
		if (typeof req.query.type !== "undefined" && typeof req.query.id !== "undefined" && typeof req.query.time !== "undefined") {
			live.register_time(req.session, req.query.type, req.query.id, req.query.time);
		}
	}
})
.get('/logout', function(req, res) {
	req.session.destroy()
	res.redirect('/')
})
// post request

.post('/comments', function(req, res) {
	comment.get_comments(req, res)
})
.post("/comment", function(req, res) {
	comment.add_comment(req, res)
})
.post("/change_language", function(req, res) {
	live.change_language(req, res)
})
.get('/getUserStats', function(req, res) {
	live.user_stats(req, res)
})
.get('/getUserStatsById', function(req, res) {
	live.user(req, res)
})
// production tests
.get('/disconnect', function(req, res) {
	req.session.destroy();
	res.redirect('/');
})
.use(function(req, res, next) {
	res.render('not_found.ejs')
});

app.listen(8008);
module.exports = app;
