let vm = new Vue({
	el: '#app',
	data() {
		return {
			img: '',
			username: '',
			hours: '',
			minutes: '',
			size: '',
			selected: '',
			items: ['en', 'fr', 'es', 'de'],
			oauth: '',
			data: {}
		}
	},
	methods: {
		change_lang() {
			axios.post('change_language', {
				language: vm.selected
			})
		}
	}
})

window.onload = function() {
	axios.get('/getUserStats').then(response => {
		const data = JSON.parse(response.data);
		vm.img = data.img;
		vm.oauth = data.oauth;
		console.log(vm.oauth);
		vm.username = data.username;
		vm.selected = data.language;
		let log = data.history;

		let total = 0;
		for (let i = 0; i < log.length; i++) {
			total += parseInt(log[i].time);
		}
		toHHMMSS(total);
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
