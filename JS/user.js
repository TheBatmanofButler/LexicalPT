/**
@author: Amol Kapoor
@date: 7-13-15
@version: 0.1

User profile functions
*/

var global_username;
var global_userEmail;
var global_userKey;

//Post Login------------------------------------------------------------------------------------------

/**
	UI function that displays the current username on top banner

	@param: username; string; the name of the user
*/
function displayCurrentUser(username) {
	if(username)
		$("#CurrentLogin").html("Logged in as: " + username);
	else
		$("#CurrentLogin").html("Not logged in");
}

/**
	Sets important variables on login

	@param: data
		@param: username
		@param:email
		@param: userKey
*/
function login(data) {
	global_userKey = data.userKey.S;
	global_username = data.username.S;
	global_userEmail = data.email.S;

	displayCurrentUser(global_username);
	$(".prelogin-content, #landingpagebutton").fadeOut( function() {	
		$(".postlogin-content").fadeIn();
	});
}


//Pre Login------------------------------------------------------------------------------------------

function registerNewUser() {
	var $inputs = $('#RegisterNewUser :input');
	
	var values = {};
    
    $inputs.each(function() {
        values[this.name] = $(this).val();
    });

    console.log(values)
	
	socket.emit("clientToServer", {
		name: "newUser",
		username: values.username,
		password: values.password,
		email: values.email, 
		fullname: values.firstname + " " + values.lastname
	}, function(data, err, appError) {
		if(err) {
			errorHandler(err, appError);
		}		
		else {
			login(data);
		}
	});
}
/**
	Triggered on login submit button, sends user/password info for cross checking from server/dbs
*/
function submitLogin() {
    $("#TitlebarForm").submit(function(event) {
		event.preventDefault();

	    var $inputs = $('#TitlebarForm :input');
		var values = {};
	    $inputs.each(function() {
	        values[this.name] = $(this).val();
	    });
	    console.log(values);
		
		socket.emit("clientToServer", {
	        name: "login",
	        username: values.username,
			password: values.password
		}, function(data, err, isAppError) {
			if(err) {
				errorHandler(err, isAppError);
			} 
			else {
				login(data);
			}
		});

		socket.emit("clientToServer", {
		    name: "comboboxes",
		}, function(data, err, isAppError) {
		if(err) {
		  errorHandler(err, isAppError);
		} 
		else {
		  PatientDateInput(data);
		}
		});

	});

	$("#TitlebarForm").submit();
}