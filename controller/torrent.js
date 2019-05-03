const srt2vtt = require('srt-to-vtt')
const fs = require('fs');
const axios = require('axios');
const RarbgApi = require('rarbg');

module.exports = {
	launch_movie: function (res, movie) {
		console.log('starting..');
		this.movie_exists(movie.imdb_code, function(path) {
			console.log('path:' + path);
			get_subs(movie.imdb_code).then(function(srt) {
				if (srt !== false) {
					console.log(srt)
					fs.createReadStream('data/subs/' + movie.imdb_code + '-fr/' + srt)
					.pipe(srt2vtt())
					.pipe(fs.createWriteStream('data/subs/' + movie.imdb_code + '-fr/sub.vtt'))
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
					download_torrent(res, movie, magnet, false)
				}
			})
		})
	},
	launch_episode: function (res, episode) {
		console.log('starting..');
		this.episode_exists(episode.id, function(path) {
			console.log('path: ' + path);
			get_episode_subs(episode).then(function(srt) {
				if (srt !== false) {
					fs.createReadStream('data/tvSubs/' + episode.id + '-fr.srt')
					.pipe(srt2vtt())
					.pipe(fs.createWriteStream('data/tvSubs/' + episode.id + '-fr.vtt'))
				}
			})
			if (path) {
				console.log('episode exists already, launching: ' + path)
				res.render('episode.ejs', {'data' : episode, 'path' : path})
			}
			else {
				console.log('episode ' + episode.id + ' isn\'t on server');
				get_episode_magnet(episode).then(function(magnet) {
					console.log('magnet-link:' + magnet)
					download_torrent(res, episode, magnet, true)
				})
			}
		})
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
	episode_exists: function (id, callback) {
		fs.readFile('./data/episodes.json', 'utf8', function readFileCallback(err, data){
			if (err){
				console.log(err);
			} else {
				if (data) {
					let counter = 0
					let obj = JSON.parse(data);

					Object.keys(obj.table).forEach(function(key) {
						if (obj.table[key].id == id) {
							counter = 1;
							callback(obj.table[key].path, obj.table[key].size);
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

function add_episode(id, file_path, file_length) {
	fs.readFile('data/movies.json', 'utf8', function readFileCallback(err, data){
		if (err){
			console.log(err);
		} else {
			if (data) {
				obj = JSON.parse(data); //now it an object
				obj.table.push({id: id, path: file_path, size: file_length}); //add some data
				json = JSON.stringify(obj); //convert it back to json
				fs.writeFile('data/episodes.json', json, 'utf8', function(err) {
					if (err) throw err;
				});
			}
			else {
				var obj = {
					table: []
				};
				obj.table.push({id: id, path: file_path, size: file_length});
				var json = JSON.stringify(obj);
				fs.writeFile('data/episodes.json', json, 'utf8', function(err) {
					if (err) throw err;
				});
			}
		}
	});
}

function download_torrent(res, movie, magnet, isTvShow) {
	const torrentStream = require('torrent-stream');
	let engine = torrentStream(magnet, {path: '/sgoinfre/Perso/angauber/hypertube/download'});
	let called = false;

	engine.on('ready', function() {
		engine.files.forEach(function(file) {
			let array = file.path.split(".")
			let ext = array[array.length - 1]
			if (ext == "mp4" || ext == "mkv") {
				file.select();
				console.log(file.path)
				if (isTvShow) {
					get_tv_path(res, movie, file, false)
				}
				else {
					get_path(res, movie, file.path, false)
				}
				const intervalId = setInterval(function () {
					if (called) {
						if (isTvShow) {
							get_tv_path(res, movie, file, true)
						}
						else {
							get_path(res, movie, file.path, true)
						}
						clearInterval(intervalId);
					}
					else {
						if (isTvShow) {
							axios.get('http://localhost:8008/size?id=' + movie.id + '&tv=true').then(response => {
								if (response.data != false) {
									let progress = parseInt(response.data);
									console.log(progress);
									if (progress == 100) {
										called = true;
									}
								}
							})
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
					}
				}, 500)
			}
			else {
				// console.log(file.name);
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

function get_tv_path(res, episode, file, bool) {
	if (bool == true) {
		console.log('starting to stream movie in 2 sec')
		console.log(file.path);
		setTimeout(function() {res.render('episode.ejs', {'data' : episode, 'path' : file.path})}, 2000);
	}
	else {
		add_episode(episode.id, file.path, file.length)
	}
}

let get_episode_subs = function(episode) {
	return new Promise(function(resolve, reject) {
		if (!fs.existsSync('data/tvSubs/' + episode.id + '-fr.srt')) {
			const addic7edApi = require('addic7ed-api');

			addic7edApi.search(episode.name, episode.season_number, episode.episode_number, 'fre').then(function (subtitlesList) {
				let subInfo = subtitlesList[0];
				if (subInfo) {
					addic7edApi.download(subInfo, './data/tvSubs/' + episode.id + '-fr.srt').then(function () {
						console.log('Subtitles file saved.');
						resolve(true);
					})
				}
			})
		}
		else {
			console.log('fr subs already exists.. skipping the download part');
			resolve(false);
		}
	})
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

let get_episode_magnet = function(show) {
	return new Promise(function(resolve, reject) {
		let season = parseInt(show.season_number)
		let episode = parseInt(show.episode_number)

		if (season < 10)
		season = '0' + season
		if (episode < 10)
		episode = '0' + episode

		season = 's' + season
		episode = 'e' + episode

		console.log(show.show_id);
		console.log(season);
		console.log(episode);
		const rarbg = new RarbgApi()
		rarbg.search({
			search_themoviedb: show.show_id,
			search_string: season + ' ' + episode + ' 1080p',
			min_seeders: 10,
			sort: 'seeders',
			category: [rarbg.categories.TV_EPISODES, rarbg.categories.TV_HD_EPISODES]
		}).then(response => {
			resolve(response[0].download)
		}).catch(error => {
			rarbg.search({
				search_themoviedb: show.show_id,
				search_string: season + ' ' + episode,
				min_seeders: 1,
				sort: 'seeders',
				category: [rarbg.categories.TV_EPISODES, rarbg.categories.TV_HD_EPISODES]
			}).then(response => {
				resolve(response[0].download)
			}).catch(error => {
				console.log(error)
				res.status(404).end()
			})
		})
	})
}
