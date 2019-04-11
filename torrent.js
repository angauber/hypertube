const WebTorrent = require('webtorrent')
const srt2vtt = require('srt2vtt');
const fs = require('fs');

module.exports = {
	launch_movie: function (res, movie) {
		movie_exists(movie.imdb_code, function(path) {
			get_subs(movie.imdb_code).then(function(srt) {

				if (srt !== false) {
					console.log(srt)
					let srtData = fs.readFileSync('data/subs/' + movie.imdb_code + '-en/' + srt);
					srt2vtt(srtData, function(err, vttData) {
						if (err) throw new Error(err);
						fs.writeFileSync('data/subs/' + movie.imdb_code + '-en/sub.vtt', vttData);
						fs.unlink('data/subs/' + movie.imdb_code + '-en/' + srt, (err) => {
							if (err) throw err;
							console.log('srt file was deleted');
						});
					});
				}
				if (path) {
					console.log('movie exists already, launching: ' + path)
					res.render('movie.ejs', {'data' : movie, 'path' : path})
				}
				else {
					console.log('movie ' + movie.imdb_code + ' isn\'t on server');
					const torrent_url = get_best_torrent(movie.torrents)
					download_torrent(res, movie, torrent_url)
				}
			})
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
			console.log('Progress: ' + (torrent.progress * 100).toFixed(1) + '% Downloading at about ' + (torrent.downloadSpeed / 1000000) + ' mB/s')
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

let get_subs = function(imdb) {
	return new Promise(function(resolve, reject) {
		const yifysubs = require('yifysubtitles-api');
		const download = require('download');

		if (!fs.existsSync('data/subs/' + imdb + '-en')) {
			yifysubs.search({imdbid: imdb, limit: 'best'}).then(function(data) {
				if (typeof data.en[0].url !== undefined) {
					console.log(data.en[0].url);

					fs.mkdir('data/subs/' + imdb + '-en', { recursive: true }, (err) => {
						if (err) throw err;
					});
					download(data.en[0].url, 'data/subs/' + imdb + '-en', {extract: true}).then(() => {
						console.log('done!');
						fs.readdir('data/subs/' + imdb + '-en', (err, files) => {
							if (typeof files[0] !== undefined) {
								resolve(files[0])
							}
						});
					});
				}
			})
		}
		else {
			console.log('en subs already exists.. skipping the download part');
			fs.readdir('data/subs/' + imdb + '-en', (err, files) => {
				if (files) {
					resolve(false)
				}
			});
		}
	})
}
