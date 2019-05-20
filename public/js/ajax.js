$(document).ready(() => {
	$("#register-form").on("submit", function (e) {
		console.log("UGVTYUFITYFITY");
		e.preventDefault();
		$.post("/form/register", $(this).serialize(), function (data) {
			document.location.href="/";
		});
	})
});
