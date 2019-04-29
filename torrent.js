const srt2vtt = require('srt2vtt');
const fs = require('fs');
const axios = require('axios');

module.exports = {
	launch_movie: function (res, movie) {
		console.log('starting..');
		this.movie_exists(movie.imdb_code, function(path) {
			console.log(path);
			get_subs(movie.imdb_code).then(function(srt) {
				if (srt !== false) {
					console.log(srt)
					let srtData = fs.readFileSync('data/subs/' + movie.imdb_code + '-fr/' + srt);
					srt2vtt(srtData, function(err, vttData) {
						if (err) throw new Error(err);
						fs.writeFileSync('data/subs/' + movie.imdb_code + '-fr/sub.vtt', vttData);
						fs.unlink('data/subs/' + movie.imdb_code + '-fr/' + srt, (err) => {
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
					const bestTorrent = module.exports.get_best_torrent(movie.torrents)
					const magnet = 'magnet:?xt=urn:btih:' + bestTorrent.hash + '&dn=' + encodeURI(movie.title_long.replace(' ', '+')) + '+[1080p]+[YTS.AM]&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337'
					console.log(magnet)
					download_torrent(res, movie, magnet)
				}
			})
		});
	},
	movie_exists: function(imdb_code, callback) {
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
	},
	get_best_torrent: function(torrents) {
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
		return torrents[torrent];
	}
};

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

function download_torrent(res, movie, magnet) {
	const torrentStream = require('torrent-stream');
	let engine = torrentStream(magnet, {path: '/sgoinfre/Perso/angauber/hypertube/download'});
	let called = false;

	engine.on('ready', function() {
		engine.files.forEach(function(file) {
			let array = file.path.split(".")
			let ext = array[array.length - 1]
			if (ext == "mp4") {
				file.select();
				console.log(file.path)
				get_path(res, movie, file.path, false)
				const intervalId = setInterval(function () {
					if (called) {
						get_path(res, movie, file.path, true)
						clearInterval(intervalId);
					}
					else {
						axios.get('http://localhost:8008/size?id=' + movie.id).then(response => {
							if (response.data != false) {
								let progress = parseInt(response.data);
								console.log(progress);
								if (progress == 100) {
									called = true;
								}
							}
						})
					}
				}, 500)
			}
			else {
				file.deselect();
			}
		});
	});
}

function get_path(res, movie, file, bool) {
	if (bool == true) {
		console.log('starting to stream movie in 3 sec')
		setTimeout(function() {res.render('movie.ejs', {'data' : movie, 'path' : file})}, 3000);
	}
	else {
		add_movie(movie.imdb_code, file)
	}
}

let get_subs = function(imdb) {
	return new Promise(function(resolve, reject) {
		const yifysubs = require('yifysubtitles-api');
		const download = require('download');

		if (!fs.existsSync('data/subs/' + imdb + '-fr')) {
			yifysubs.search({imdbid: imdb, limit: 'best'}).then(function(data) {
				if (typeof data.fr[0].url !== undefined) {
					console.log(data.fr[0].url);

					fs.mkdir('data/subs/' + imdb + '-fr', { recursive: true }, (err) => {
						if (err) throw err;
					});
					download(data.fr[0].url, 'data/subs/' + imdb + '-fr', {extract: true}).then(() => {
						console.log('done!');
						fs.readdir('data/subs/' + imdb + '-fr', (err, files) => {
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
			fs.readdir('data/subs/' + imdb + '-fr', (err, files) => {
				if (files) {
					resolve(false)
				}
			});
		}
	})
}
