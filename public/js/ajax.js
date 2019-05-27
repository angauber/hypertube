$(document).ready(() => {
	$("#register-form").on("submit", function (e) {
		e.preventDefault();
		$.post("/form/register", $(this).serialize(), function (data) {
			if (data == '1') {
				$(".errMessage").remove();
                document.location.href="/";
            }
            else {
                $(".errMessage").remove();
                $( ".error" ).append( "<div class='errMessage'><h4> Error : " + data + "</h4></div>" );
            }
		});
	}),

	$("#signin-form").on("submit", function (e) {
		e.preventDefault();
		$.post("/form/signin", $(this).serialize(), function (data) {
			if (data == '1') {
				$(".errMessage").remove();
				document.location.href="/";
			}
			else {
				$(".errMessage").remove();
				$( ".error" ).append( "<div class='errMessage'><h4> Error : " + data + "</h4></div>" );
			}
		});
	}),

	$("#forget-form").on("submit", function (e) {
		e.preventDefault();
		$.post("/form/forget", $(this).serialize(), function (data) {
			if (data == '1') {
				$(".errMessage").remove();
				document.location.href="/";
			}
			else {
				$(".errMessage").remove();
				$( ".error" ).append( "<div class='errMessage'><h4> Error : " + data + "</h4></div>" );
			}
		});
	}),
	
	$("#change-form").on("submit", function (e) {
		e.preventDefault();
		$.post("/form/change-password", $(this).serialize(), function (data) {
			if (data == '1')
			{
				$(".errMessage").remove();
				document.location.href="/";
			}
			else {
				$(".errMessage").remove();
				$( ".error" ).append( "<div class='errMessage'><h4> Error : " + data + "</h4></div>" );
			}
		});
	}),

	$("#disconnect").on("click", function (e) {
		e.preventDefault();
		$.get("/disconnect", function (data) {
			             
		});
	})
});
