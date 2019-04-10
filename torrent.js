const WebTorrent = require('webtorrent')
const fs = require('fs');

module.exports = {
	launch_movie: function (res, movie) {
		const torrent_url = get_best_torrent(movie.torrents)

		movie_exists(movie.imdb_code, function(path) {
			if (path) {
				console.log('movie exists already, launching: ' + path)
				res.render('movie.ejs', {'data' : movie, 'path' : path})
			}
			else {
				console.log('movie ' + movie.imdb_code + ' isn\'t on server');
				download_torrent(res, movie, torrent_url)
			}
		});
	},
};

function movie_exists(imdb_code, callback) {
	fs.readFile('./data/movies.json', 'utf8', function readFileCallback(err, data){
		if (err){
			console.log(err);
		} else {
			if (data) {
				let counter = 0
				let obj = JSON.parse(data);

				Object.keys(obj.table).forEach(function(key) {
					if (obj.table[key].imdb == imdb_code) {
						counter = 1;
						callback(obj.table[key].path);
					}
				});
				if (counter == 0)
				callback(false);
			}
			else {
				callback(false);
			}
		}
	});
}

function add_movie(imdb_code, file_path) {
	fs.readFile('data/movies.json', 'utf8', function readFileCallback(err, data){
		if (err){
			console.log(err);
		} else {
			if (data) {
				obj = JSON.parse(data); //now it an object
				obj.table.push({imdb: imdb_code, path: file_path}); //add some data
				json = JSON.stringify(obj); //convert it back to json
				fs.writeFile('data/movies.json', json, 'utf8', function(err) {
					if (err) throw err;
				});
			}
			else {
				var obj = {
					table: []
				};
				obj.table.push({imdb: imdb_code, path: file_path});
				var json = JSON.stringify(obj);
				fs.writeFile('data/movies.json', json, 'utf8', function(err) {
					if (err) throw err;
				});
			}
		}
	});
}

function download_torrent(res, movie, url) {
	const client = new WebTorrent()
	let called = false;

	console.log(url);
	client.add(url, { path: '/sgoinfre/Perso/angauber/hypertube/download' }, function (torrent) {
		console.log('torrent download started')
		const intervalID = setInterval(function () {
			console.log('Progress: ' + (torrent.progress * 100).toFixed(1) + '%')
			if (torrent.progress * 100 >= 100) {
				clearInterval(intervalID);
			}
			if ((torrent.progress * 100) > 1 && !called) {
				called = true;
				console.log('going to the movie page')
				get_path(res, movie, torrent.files)
			}
		}, 5000)
		torrent.on('done', function () {
			console.log('torrent download finished')
		})
	})
}

function get_path(res, movie, files) {
	for (let i = 0; i < files.length; i++) {
		const array = files[i].path.split(".")
		const ext = array[array.length - 1]

		if (ext == "mp4") {
			console.log('starting to stream movie')
			add_movie(movie.imdb_code, files[i].path)
			res.render('movie.ejs', {'data' : movie, 'path' : files[i].path})
		}
	}
}


function get_best_torrent(torrents) {
	let seeds = false
	let torrent = false

	for (let i = 0; i < torrents.length; i++) {
		if (torrents[i].quality == '1080p') {
			if (!seeds) {
				seeds = torrents[i].seeds
				torrent = i
			}
			if (seeds < torrents[i].seeds) {
				seeds = torrents[i].seeds
				torrent = i;
			}
		}
	}
	return torrents[torrent].url;
}
