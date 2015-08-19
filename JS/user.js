/**
@author: Amol Kapoor
@date: 7-13-15
@version: 0.1

User profile functions
*/

//Post Login------------------------------------------------------------------------------------------

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

	localStorage.setItem("username", global_username);
	localStorage.setItem("password", $("#PasswordField").val());

	postLogin();

	PatientDateInput(data['dataFromScan']);
}

/**
	Resets all variables and sends the user back to the home screen
*/
function logout() {
	global_userKey = null;
	global_username = null;
	global_userEmail = null;
	displayCurrentUser();
	removeForms();

	postLogout();
}

/**
	Calls the lougout function on the server
*/
function submitLogout() {
	socket.emit("clientToServer", {
		name: "logout",
		userKey: global_userKey
	}, function() {
		logout();
	});
}


//Pre Login------------------------------------------------------------------------------------------

/**
	Triggered on login submit button, sends user/password info for cross checking from server/dbs
*/
function submitLogin() {
    var $inputs = $('#TitlebarForm :input');
	var values = {};
    $inputs.each(function() {
        values[this.name] = $(this).val();
    });

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
}