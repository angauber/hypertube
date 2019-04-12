let page = 1;

new Vue({
	el: '#app',
	data() {
		return {
			rating: 3,
			dialog: false,
			bottom: false,
			movies: []
		}
	},
	methods: {
		goto_movie(id) {
			this.dialog = true
			window.location.replace('/movie?id=' + id);
		},
		bottomVisible() {
			if($(window).scrollTop() + $(window).height() == $(document).height()) {
				return true;
			}
			else {
				return false;
			}
		},
		addNewPage() {
			axios.get('/pagination?page=' + page)
			.then(response => {
				let api = response.data.data;

				for (let i = 0; i < api.length; i++) {
					let apiInfo = {
						img : api[i].large_cover_image,
						movie_id : api[i].id,
					};
					this.movies.push(apiInfo);
				}
			})
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
			window.location.replace('/query?name=' + search.value);
		}
	}

	document.getElementById("home").onclick = function() {
		window.location.replace('/');
	}
}
