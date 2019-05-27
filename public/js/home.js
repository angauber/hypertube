let page = 1;

new Vue({
	el: '#app',
	data() {
		return {
			load_value: 0,
			dialog: false,
			bottom: false,
			movies: []
		}
	},
	methods: {
		goto_movie(id) {
			this.dialog = true
			window.location.replace('/movie?id=' + id);
			console.log(id);
			setInterval(() => {
				axios.get('/size?id=' + id).then(response => {
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
		bottomVisible() {
			if($(window).scrollTop() + $(window).height() == $(document).height()) {
				return true;
			}
			else {
				return false;
			}
		},
		addNewPage() {
			axios.get('/pagination?page=' + page).then(response => {
				let api = response.data.data;
				let viewed;
				for (let i = 0; i < api.length; i++) {
					viewed = false;
					for (let j = 0; j < this.history.length; j++) {
						if (parseInt(this.history[j].code) == parseInt(api[i].id)) {
							viewed = true
						}
					}
					console.log(viewed);
					let apiInfo = {
						img : api[i].large_cover_image,
						name : api[i].title,
						rating : (parseInt(api[i].rating) / 2).toString(),
						movie_id : api[i].id,
						viewed : viewed
					};
					console.log(apiInfo.viewed);
					this.movies.push(apiInfo);
				}
			})
		},

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
		axios.get('/getUserStats').then(response => {
			const data = JSON.parse(response.data);
			this.history = data.history;
		});
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
