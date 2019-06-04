let page = 1;

new Vue({
	el: '#app',
	data() {
		return {
			items: ['Movies', 'TV shows'],
			bottom: false,
			selected: 'Popularity',
			items: ['Popularity', 'Rating', 'Latest'],
			shows: [],
			menu: [
		        { href: '/', title: 'Movies' },
		        { href: 'tv', title: 'Tv shows' },
		        { href: 'stats', title: 'Stats' },
				{ href: 'logout', title: 'Logout' }
	      	]
		}
	},
	methods: {
		menuItems () {
			return this.menu
		},
		goto_show(id) {
			window.location.href = '/show?id=' + id;
		},
		bottomVisible() {
			if ($(window).scrollTop() + $(window).height() == $(document).height()) {
				return true;
			}
			else {
				return false;
			}
		},
		addNewPage() {
			for (let j = 0; j < 3; j++) {
				axios.get('/tvPagination?page=' + page + '&order=' + this.selected).then(response => {
					let api = response.data.data;

					for (let i = 0; i < api.length; i++) {
						if (api[i].poster_path != null) {
							let apiInfo = {
								img : 'https://image.tmdb.org/t/p/w1280' + api[i].poster_path,
								name : api[i].original_name,
								rating : (parseInt(api[i].vote_average) / 2).toString(),
								show_id : api[i].id,
							};
							this.shows.push(apiInfo);
						}
					}
				})
				page++;
			}
		},
		orderBy() {
			page = 1;
			this.shows = [];
			this.addNewPage();
		}
	},
	watch: {
		bottom(bottom) {
			if (bottom) {
				page++;
				this.addNewPage();
			}
		}
	},
	created() {
		window.addEventListener('scroll', () => {
			this.bottom = this.bottomVisible()
		})
		this.addNewPage();
	}
})

window.onload = function() {
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
