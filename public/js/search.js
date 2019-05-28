new Vue({
	el: '#app',
	data() {
		return {
			load_value: 0,
			dialog: false,
		}
	},
	methods: {
		goto_movie(id) {
			this.dialog = true
			window.location.replace('/movie?id=' + id);
			setInterval(() => {
				axios.get('/size?id=' + id).then(response => {
					if (response.data != false) {
						this.load_value = parseInt(response.data);
					}
				})
			}, 1000);
		},
		goto_show(id) {
			window.location.replace('/show?id=' + id);
		},
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
