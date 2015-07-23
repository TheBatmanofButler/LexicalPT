/**
@author: Amol Kapoor
@date: 7-13-15
@version: 0.1

User profile functions
*/

var global_username;
var global_userEmail;
var global_userKey;

function errorHandler(data, isAppError) {
	console.log(data);
	alert(data.message);
}

function displayCurrentUser(username) {
	if(username)
		$("#CurrentLogin").html("Logged in as: " + username);
	else
		$("#CurrentLogin").html("Not logged in");
}

/**
	@param: data
		@param: username
		@param:email
		@param: userKey
*/
function login(data) {
	alert()
	global_userKey = data.userKey.S;
	global_username = data.username.S;
	global_userEmail = data.email.S;

	displayCurrentUser(global_username);
	$(".prelogin-content").fadeOut( function() {	
		$(".postlogin-content").fadeIn();
	});
}
