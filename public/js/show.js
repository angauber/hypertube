let vm = new Vue({
	el: '#app',
	data() {
		return {
			load_value: 0,
			dialog: false,
			seasons: [],
			episodes: [],
			img: '',
			id: '',
			name: ''
		}
	},
	methods: {
		goto_episode(episode) {
			this.dialog = true
			window.location.replace('/episode?id=' + episode.show_id + '&name=' + this.name + '&season=' + episode.season_number + '&episode=' + episode.episode_number)
			setInterval(() => {
				axios.get('/size?id=' + episode.id + '&tv=true').then(response => {
					if (response.data != false) {
						this.load_value = parseInt(response.data);
						console.log(this.load_value);
					}
					else {
						console.log(response);
					}
				})
			}, 500);
		},
		loadEpisodes(a) {
			let season = a.split(' ')[1];

			axios.get('https://api.themoviedb.org/3/tv/' + vm.id + '/season/' + season + '?api_key=425328382852ef8b6cd2922a26662d56&language=en-US').then(response => {

				let today = new Date().getTime();

				for (let i = 0; i < response.data.episodes.length; i++) {
					if (today < new Date(response.data.episodes[i].air_date).getTime()) {
						console.log('episode hasnt aired yet, removing it');
						response.data.episodes.splice(i);
					}
					else {
						response.data.episodes[i].still_path = 'https://image.tmdb.org/t/p/w1280' + response.data.episodes[i].still_path;
					}
				}
				vm.episodes = response.data.episodes;
			});
		}
	}
})

window.onload = function() {
	const id = window.location.search.substring(1).split('=')[1];

	vm.id = id;
	axios.get('https://api.themoviedb.org/3/tv/' + id + '?api_key=425328382852ef8b6cd2922a26662d56&language=en-US').then(response => {
		const show = response.data;
		let j = 0;

		vm.seasons.splice(parseInt(show.number_of_seasons));
		vm.name = show.original_name;
		vm.img = 'https://image.tmdb.org/t/p/w1280' + show.poster_path;

		for (let i = 0; i < show.seasons.length; i++) {
			if (parseInt(show.seasons[i].season_number) > 0) {
				Vue.set(vm.seasons, j, 'Season ' + parseInt(show.seasons[i].season_number));
				j++;
			}
		}
	});

	const search = document.getElementById("search_input");

	search.onkeyup = function(event) {
		if (event.keyCode == 13) {
			window.location.replace('/tvQuery?name=' + search.value);
		}
	}

	document.getElementById("home").onclick = function() {
		window.location.replace('/');
	}
}
