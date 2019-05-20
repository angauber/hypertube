let id;

let vm = new Vue({
	el: '#app',
	data() {
		return {
			message: '',
			messages: []
		}
	},
	methods: {
		add_comment() {
			let msg = this.message;

			if (msg.length > 3 && msg.length < 201) {
				console.log(msg);
				axios.post('/comment', {
					message: msg,
					type: 'tv',
					id: id
				}).then(function() {
					vm.message = '';
					axios.post('/comments', {
						type: 'tv',
						id: id
					}).then(function(res) {
						console.log(res.data);
						vm.messages = res.data;
					})
				})
			}
		}
	},
	mounted() {
		window.onload = function() {
			id = document.getElementsByClassName('calin')[0].children[0].id;

			console.log(id);
			axios.post('/comments', {
				type: 'tv',
				id: id
			}).then(function(res) {
				console.log(res.data);
				vm.messages = res.data
			})
		}
	}
})

const search = document.getElementById("search_input");

document.getElementById("php").onclick = function() {
	window.location.replace('/');
}

search.onkeyup = function(event) {
	if (event.keyCode == 13) {
		window.location.replace('/tvQuery?name=' + search.value);
	}
}

window.onbeforeunload = function() {
	const time = document.getElementById("my-video_html5_api").currentTime;

	axios.get('/time?type=tv&id=' + id + '&time=' + time);
}
