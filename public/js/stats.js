let vm = new Vue({
	el: '#app',
	data() {
		return {
			img: '',
			username: '',
			name: '',
			time: '',
			size: ''
		}
	}
})

window.onload = function() {
	axios.get('/getUserStats').then(response => {
		const data = JSON.parse(response.data);
		console.log(data);
		vm.img = data.img;
		vm.username = data.login;
		vm.name = data.name;

		let log = data.history;
		console.log(log);

		let total = 0;
		for (let i = 0; i < log.length; i++) {
			total += parseInt(log[i].time);
		}
		vm.time = toHHMMSS(total);
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
	return hours +' hour(s) ' + minutes + ' minute(s)';
}
