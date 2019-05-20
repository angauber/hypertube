let vm = new Vue({
	el: '#app',
	data() {
		return {
			empty: false,
			img: '',
			username: '',
			hours: '',
			minutes: '',
			size: '',
			selected: '',
			data: {}
		}
	},
	methods: {
		change_lang() {
			console.log(vm.selected);
			axios.post('change_language', {
				language: vm.selected
			})
		}
	}
})

window.onload = function() {
	let params = window.location.search.substring(1).split('&');
	axios.get('/getUserStatsById?' + params[0] + '&' + params[1]).then(response => {
		const data = JSON.parse(response.data);
		console.log(data);
		if (data != false) {
			vm.img = data.img;
			vm.username = data.username;
			vm.selected = data.language;
			let log = data.history;

			let total = 0;
			for (let i = 0; i < log.length; i++) {
				total += parseInt(log[i].time);
			}
			toHHMMSS(total);
		}
		else {
			vm.empty = true;
		}
	});

	document.getElementById("home").onclick = function() {
		window.location.replace('/');
	}
}

function toHHMMSS (sec_num) {
	var hours   = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);

	if (hours   < 10) {hours   = "0"+hours;}
	if (minutes < 10) {minutes = "0"+minutes;}
	vm.hours = hours;
	vm.minutes = minutes;
}
