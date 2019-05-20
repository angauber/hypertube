$(document).ready(() => {
	$("#register-form").on("submit", function (e) {
		e.preventDefault();
		$.post("/form/register", $(this).serialize(), function (data) {
			if (data == '1') {
				$(".errMessage").remove();
                document.location.href="/signup";
            }
            else {
                $(".errMessage").remove();
                $( ".error" ).append( "<div class='errMessage'><h4> Error : " + data + "</h4></div>" );
            }
		});
	})
});
