const srt2vtt = require('srt-to-vtt')
const fs = require('fs');
const axios = require('axios');
const RarbgApi = require('rarbg');

const files = require('../model/files.js')

module.exports = {
	launch_movie: function (res, movie, language) {
		this.movie_exists(movie.imdb_code, function(mv) {
			let path = mv.path
			get_subs(movie.imdb_code, language).then(function(srt) {
				if (srt !== false) {
					if (srt == null) {
						language = null
					}
					else {
						fs.createReadStream('data/subs/' + movie.imdb_code + '-' + language + '/' + srt)
						.pipe(srt2vtt())
						.pipe(fs.createWriteStream('data/subs/' + movie.imdb_code + '-' + language + '/sub.vtt'))
					}
				}
				if (path) {
					var today = new Date();
					var dd = String(today.getDate()).padStart(2, '0');
					var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
					var yyyy = today.getFullYear();

					today = mm + '/' + dd + '/' + yyyy;
					files.update_movie(path, {lastseen: today})

					res.render('movie.ejs', {'data' : movie, 'path' : path, 'language' : language})
				}
				else {
					const bestTorrent = module.exports.get_best_torrent(movie.torrents)
					const magnet = 'magnet:?xt=urn:btih:' + bestTorrent.hash + '&dn=' + encodeURI(movie.title_long.replace(' ', '+')) + '+[1080p]+[YTS.AM]&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337'
					console.log(magnet)
					movie.size = bestTorrent.size_bytes
					movie.language = language
					download_torrent(res, movie, magnet, false)
				}
			})
		})
	},
	launch_episode: function (res, episode, language) {
		this.episode_exists(episode.id, function(ep) {
			let path = ep.path
			get_episode_subs(episode, language).then(function(srt) {
				if (srt !== false) {
					if (srt == null) {
						language = null
					}
					else {
						fs.createReadStream('data/tvSubs/' + episode.id + '-' + language + '.srt')
						.pipe(srt2vtt())
						.pipe(fs.createWriteStream('data/tvSubs/' + episode.id + '-' + language + '.vtt'))
					}
				}
			})
			if (path) {
				var today = new Date();
				var dd = String(today.getDate()).padStart(2, '0');
				var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
				var yyyy = today.getFullYear();

				today = mm + '/' + dd + '/' + yyyy;
				files.update_episode(path, {lastseen: today})

				res.render('episode.ejs', {'data' : episode, 'path' : path, 'language' : language})
			}
			else {
				console.log('episode ' + episode.id + ' isn\'t on server');
				get_episode_magnet(episode, res).then(function(magnet) {
					console.log('magnet-link:' + magnet)
					episode.language = language
					download_torrent(res, episode, magnet, true)
				})
			}
		})
	},
	movie_exists: function(imdb_code, callback) {
		files.find_movie({id: imdb_code}).then(function(result) {
			if (typeof result[0] !== "undefined") {
				callback(result[0]);
			}
			else {
				callback(false);
			}
		})
	},
	episode_exists: function (id, callback) {
		files.find_episode({id: id}).then(function(result) {
			if (typeof result[0] !== "undefined") {
				callback(result[0]);
			}
			else {
				callback(false);
			}
		})
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

function download_torrent(res, movie, magnet, isTvShow) {
	const torrentStream = require('torrent-stream');
	let engine = torrentStream(magnet, {path: process.env.DL_PATH});
	let called = false;
	let found = false;
	let please;

	engine.on('ready', function() {
		engine.files.sort((a, b) => b.length - a.length);
		engine.files.forEach(function(file) {
			let array = file.path.split(".")
			let ext = array[array.length - 1]
			if ((ext == "mp4" || ext == "mkv") && !found) {
				found = true;
				file.select();
				please = file.path
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
							axios.get('/size?id=' + movie.id + '&tv=true').then(response => {
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
							axios.get('/size?id=' + movie.id).then(response => {
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
				file.deselect();
			}
		});
	})
	engine.on('idle', function() {
		console.log('all files have been downloaded');
		if (isTvShow) {
			console.log('updating episode');
			console.log(please);
			files.update_episode(please, {downloaded: true})
		}
		else {
			console.log('updating movie');
			files.update_movie(please, {downloaded: true})
		}
	})
}

function get_path(res, movie, file, bool) {
	if (bool == true) {
		console.log('starting to stream movie in 3 sec')
		setTimeout(function() {res.render('movie.ejs', {'data' : movie, 'path' : file, 'language': movie.language})}, 3000);
	}
	else {
		var today = new Date();
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = today.getFullYear();

		today = mm + '/' + dd + '/' + yyyy;
		files.add_movie(movie.imdb_code, movie.size, file, today)
	}
}

function get_tv_path(res, episode, file, bool) {
	if (bool == true) {
		console.log('starting to stream movie in 2 sec')
		setTimeout(function() {res.render('episode.ejs', {'data' : episode, 'path' : file.path, 'language': episode.language})}, 2000);
	}
	else {
		var today = new Date();
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = today.getFullYear();

		today = mm + '/' + dd + '/' + yyyy;
		files.add_episode(episode.id, file.length, file.path, today)
	}
}

let get_episode_subs = function(episode, language) {
	return new Promise(function(resolve, reject) {
		if (!fs.existsSync('data/tvSubs/' + episode.id + '-' + language + '.srt')) {
			const addic7edApi = require('addic7ed-api');

			if (language == 'fr') {
				addic7edApi.search(episode.name, episode.season_number, episode.episode_number, 'fre').then(function (subtitlesList) {
					let subInfo = subtitlesList[0];
					if (subInfo) {
						addic7edApi.download(subInfo, './data/tvSubs/' + episode.id + '-fr.srt').then(function () {
							resolve(true);
						})
					}
					else {
						resolve(null)
					}
				})
			}
			else if (language == 'en') {
				addic7edApi.search(episode.name, episode.season_number, episode.episode_number, 'eng').then(function (subtitlesList) {
					let subInfo = subtitlesList[0];
					if (subInfo) {
						addic7edApi.download(subInfo, './data/tvSubs/' + episode.id + '-en.srt').then(function () {
							resolve(true);
						})
					}
					else {
						resolve(null)
					}
				})
			}
			else if (language == 'es') {
				addic7edApi.search(episode.name, episode.season_number, episode.episode_number, 'spa').then(function (subtitlesList) {
					let subInfo = subtitlesList[0];
					if (subInfo) {
						addic7edApi.download(subInfo, './data/tvSubs/' + episode.id + '-es.srt').then(function () {
							resolve(true);
						})
					}
					else {
						resolve(null)
					}
				})
			}
			else {
				addic7edApi.search(episode.name, episode.season_number, episode.episode_number, 'ger').then(function (subtitlesList) {
					let subInfo = subtitlesList[0];
					if (subInfo) {
						addic7edApi.download(subInfo, './data/tvSubs/' + episode.id + '-de.srt').then(function () {
							resolve(true);
						})
					}
					else {
						resolve(null)
					}
				})
			}
		}
		else {
			resolve(false);
		}
	})
}

let get_subs = function(imdb, language) {
	return new Promise(function(resolve, reject) {
		const yifysubs = require('yifysubtitles-api');
		const download = require('download');

		if (!fs.existsSync('data/subs/' + imdb + '-' + language)) {
			yifysubs.search({imdbid: imdb, limit: 'best'}).then(function(data) {
				if (language == 'fr') {
					if (typeof data.fr !== "undefined") {
						fs.mkdir('data/subs/' + imdb + '-fr', { recursive: true }, (err) => {
							if (err) throw err;
						});
						download(data.fr[0].url, 'data/subs/' + imdb + '-fr', {extract: true}).then(() => {
							fs.readdir('data/subs/' + imdb + '-fr', (err, files) => {
								if (typeof files[0] !== "undefined") {
									resolve(files[0])
								}
							});
						});
					}
					else {
						resolve(null)
					}
				}
				else if (language == 'en') {
					if (typeof data.en !== "undefined") {
						fs.mkdir('data/subs/' + imdb + '-en', { recursive: true }, (err) => {
							if (err) throw err;
						});
						download(data.en[0].url, 'data/subs/' + imdb + '-en', {extract: true}).then(() => {
							fs.readdir('data/subs/' + imdb + '-en', (err, files) => {
								if (typeof files[0] !== "undefined") {
									resolve(files[0])
								}
							});
						});
					}
					else {
						resolve(null)
					}
				}
				else if (language == 'es') {
					if (typeof data.es !== "undefined") {
						fs.mkdir('data/subs/' + imdb + '-es', { recursive: true }, (err) => {
							if (err) throw err;
						});
						download(data.es[0].url, 'data/subs/' + imdb + '-es', {extract: true}).then(() => {
							fs.readdir('data/subs/' + imdb + '-es', (err, files) => {
								if (typeof files[0] !== "undefined") {
									resolve(files[0])
								}
							});
						});
					}
					else {
						resolve(null)
					}
				}
				else {
					if (typeof data.de !== "undefined") {
						fs.mkdir('data/subs/' + imdb + '-de', { recursive: true }, (err) => {
							if (err) throw err;
						});
						download(data.de[0].url, 'data/subs/' + imdb + '-de', {extract: true}).then(() => {
							fs.readdir('data/subs/' + imdb + '-de', (err, files) => {
								if (typeof files[0] !== undefined) {
									resolve(files[0])
								}
							});
						});
					}
					else {
						resolve(null)
					}
				}
			})
		}
		else {
			fs.readdir('data/subs/' + imdb + '-' + language, (err, files) => {
				if (files) {
					resolve(false)
				}
			});
		}
	})
}

let get_episode_magnet = function(show, res) {
	return new Promise(function(resolve, reject) {
		let season = parseInt(show.season_number)
		let episode = parseInt(show.episode_number)

		if (season < 10)
		season = '0' + season
		if (episode < 10)
		episode = '0' + episode

		season = 's' + season
		episode = 'e' + episode

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
				res.render('not_found.ejs')
			})
		})
	})
}
