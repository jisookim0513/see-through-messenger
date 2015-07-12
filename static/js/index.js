// make POST request to the server 
function submitPassword(pw) {
	$.ajax({
	    url: "/api/auth",
	    type: "POST",
	    data: {
        	password: pw
    	},
	    success: function(data) {
	    	goToChat(data);
	    },
	    error: function(data) {
	    	alert("Failed to authenticate. Try again!");
	    }
 	});
}

// set cookie and redirect to chat page
function goToChat(cookie) {
	docCookies.setItem('cookie', cookie, 60*60*24*30);
	window.location = "/chat.html";
}

$('div').animate({scrollTop: height});