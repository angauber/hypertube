let time
new Vue({
	el: '#app'
})

const search = document.getElementById("search_input");

document.getElementById("php").onclick = function() {
	window.location.replace('/');
}
search.onkeyup = function(event) {
	if (event.keyCode == 13) {
		window.location.replace('/query?name=' + search.value);
	}
}

window.onbeforeunload = function() {
	const id = window.location.search.split("=")[1];
	const time = document.getElementById("my-video_html5_api").currentTime;

	axios.get('/time?type=movie&id=' + id + '&time=' + time);
}
