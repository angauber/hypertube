const srt2vtt = require('srt-to-vtt')
const fs = require('fs');
const axios = require('axios');
const RarbgApi = require('rarbg');

const files = require('../model/files.js')

module.exports = {
	launch_movie: function (res, movie, language) {
		this.movie_exists(movie.id, function(mv) {
			let path = mv.path
			console.log('path:' + path);
			console.log(language);
			get_subs(movie.imdb_id, language).then(function(srt) {
				if (srt !== false) {
					console.log(srt)
					fs.createReadStream('data/subs/' + movie.imdb_id + '-' + language + '/' + srt)
					.pipe(srt2vtt())
					.pipe(fs.createWriteStream('data/subs/' + movie.imdb_id + '-' + language + '/sub.vtt'))
				}
				if (path) {
					console.log('movie exists already, launching: ' + path)
					res.render('movie.ejs', {'data' : movie, 'path' : path, 'language' : language})
				}
				else {
					console.log('movie ' + movie.id + ' isn\'t on server');
					get_movie_magnet(movie.id).then(function(magnet) {
						console.log(magnet);
						if (!magnet) {
							res.render('not_found.ejs')
						}
						else {
							movie.language = language
							download_torrent(res, movie, magnet, false)
						}
					})
				}
			})
		})
	},
	launch_episode: function (res, episode, language) {
		this.episode_exists(episode.id, function(ep) {
			let path = ep.path
			get_episode_subs(episode, language).then(function(srt) {
				if (srt !== false) {
					fs.createReadStream('data/tvSubs/' + episode.id + '-' + language + '.srt')
					.pipe(srt2vtt())
					.pipe(fs.createWriteStream('data/tvSubs/' + episode.id + '-' + language + '.vtt'))
				}
			})
			if (path) {
				console.log('episode exists already, launching: ' + path)
				res.render('episode.ejs', {'data' : episode, 'path' : path, 'language' : language})
			}
			else {
				console.log('episode ' + episode.id + ' isn\'t on server');
				get_episode_magnet(episode).then(function(magnet) {
					console.log('magnet-link:' + magnet)
					episode.language = language
					download_torrent(res, episode, magnet, true)
				})
			}
		})
	},
	movie_exists: function(id, callback) {
		files.find_movie({id: id}).then(function(result) {
			console.log(result);
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
			console.log(result);
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
	let engine = torrentStream(magnet, {path: '/sgoinfre/Perso/angauber/hypertube/download'});
	let called = false;
	let please;

	engine.on('ready', function() {
		engine.files.forEach(function(file) {
			let array = file.path.split(".")
			let ext = array[array.length - 1]
			if (ext == "mp4" || ext == "mkv") {
				file.select()
				please = file.path
				if (isTvShow) {
					get_tv_path(res, movie, file, false)
				}
				else {
					get_path(res, movie, file, false)
				}
				const intervalId = setInterval(function () {
					if (called) {
						if (isTvShow) {
							get_tv_path(res, movie, file, true)
						}
						else {
							get_path(res, movie, file, true)
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
				file.deselect()
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
			console.log(please);
			files.update_movie(please, {downloaded: true})
		}
	})
}

function get_path(res, movie, file, bool) {
	if (bool == true) {
		console.log('starting to stream movie in 3 sec')
		setTimeout(function() {res.render('movie.ejs', {'data' : movie, 'path' : file.path, 'language': movie.language})}, 3000);
	}
	else {
		console.log(movie);
		files.add_movie(movie.id, file.length, file.path)
	}
}

function get_tv_path(res, episode, file, bool) {
	if (bool == true) {
		console.log('starting to stream movie in 2 sec')
		console.log(file.path);
		setTimeout(function() {res.render('episode.ejs', {'data' : episode, 'path' : file.path, 'language': episode.language})}, 2000);
	}
	else {
		files.add_episode(episode.id, file.length, file.path)
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
							console.log('Subtitles file saved.');
							resolve(true);
						})
					}
				})
			}
			else if (language == 'en') {
				addic7edApi.search(episode.name, episode.season_number, episode.episode_number, 'eng').then(function (subtitlesList) {
					let subInfo = subtitlesList[0];
					if (subInfo) {
						addic7edApi.download(subInfo, './data/tvSubs/' + episode.id + '-en.srt').then(function () {
							console.log('Subtitles file saved.');
							resolve(true);
						})
					}
				})
			}
			else if (language == 'es') {
				addic7edApi.search(episode.name, episode.season_number, episode.episode_number, 'spa').then(function (subtitlesList) {
					let subInfo = subtitlesList[0];
					if (subInfo) {
						addic7edApi.download(subInfo, './data/tvSubs/' + episode.id + '-es.srt').then(function () {
							console.log('Subtitles file saved.');
							resolve(true);
						})
					}
				})
			}
			else {
				console.log('searcging for deuitsh subs');
				addic7edApi.search(episode.name, episode.season_number, episode.episode_number, 'ger').then(function (subtitlesList) {
					console.log('found those subs:' + subtitlesList);
					console.log(subtitlesList);
					let subInfo = subtitlesList[0];
					if (subInfo) {
						addic7edApi.download(subInfo, './data/tvSubs/' + episode.id + '-de.srt').then(function () {
							console.log('Subtitles file saved.');
							resolve(true);
						})
					}
				})
			}
		}
		else {
			console.log(language + ' subs already exists.. skipping the download part');
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
							console.log('done!');
							fs.readdir('data/subs/' + imdb + '-fr', (err, files) => {
								if (typeof files[0] !== "undefined") {
									resolve(files[0])
								}
							});
						});
					}
					else {
						resolve(false)
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
						resolve(false)
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
				}
				else {
					if (typeof data.de !== "undefined") {
						fs.mkdir('data/subs/' + imdb + '-de', { recursive: true }, (err) => {
							if (err) throw err;
						});
						console.log(data);
						download(data.de[0].url, 'data/subs/' + imdb + '-de', {extract: true}).then(() => {
							fs.readdir('data/subs/' + imdb + '-de', (err, files) => {
								if (typeof files[0] !== undefined) {
									resolve(files[0])
								}
							});
						});
					}
					else {
						resolve(false)
					}
				}
			})
		}
		else {
			console.log(language + ' subs already exists.. skipping the download part');
			fs.readdir('data/subs/' + imdb + '-' + language, (err, files) => {
				if (files) {
					resolve(false)
				}
			});
		}
	})
}

let get_movie_magnet = function(id) {
	return new Promise(function(resolve, reject) {
		console.log(id);
		const rarbg = new RarbgApi()
		rarbg.search({
			search_themoviedb: id,
			search_string: ' 1080p',
			sort: 'seeders',
			category: [rarbg.categories.MOVIES_X264, rarbg.categories.MOVIES_X264_1080, rarbg.categories.MOVIES_X264_720],
			min_seeders: 50
		}).then(response => {
			resolve(response[0].download)
		}).catch(error => {
			rarbg.search({
				search_themoviedb: id,
				sort: 'seeders',
				category: [rarbg.categories.MOVIES_X264, rarbg.categories.MOVIES_X264_1080, rarbg.categories.MOVIES_X264_720],
				min_seeders: 1
			}).then(response => {
				resolve(response[0].download)
			}).catch(error => {
				console.log('Ooops no torrent founds')
				resolve(false)
			})
		})
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
			category: [rarbg.categories.TV_HD_EPISODES]
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
				console.log('Ooops no torrent founds')
				resolve(false)
			})
		})
	})
}
