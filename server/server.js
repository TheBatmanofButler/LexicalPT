//AWS
//export AWS_ACCESS_KEY_ID
//export AWS_SECRET_ACCESS_KEY

var AWS = require('aws-sdk');
var loginTools = require('./loginTools');
var storageTools = require('./storageTools');


//AWS config
AWS.config.region = 'us-east-1';
var userTable = new AWS.DynamoDB({params: {TableName: 'JAGUsers'}});
var fileTable = new AWS.DynamoDB({params: {TableName: 'JAGClientData'}});

//Sockets
var io = require('socket.io').listen(4000);

/**
	Checks an input string to make sure it is sanitized for database input

	@param: inputString; string; the string to be checked

	@return: true if alphanumeric string of some length, false otherwise
*/
function isSanitized(inputString) {
	if(!inputString || typeof inputString !== 'string' || inputString.length === 0 || !/^[a-z0-9]+$/i.test(inputString))
		return false;
	return true;
}

function removeFormsFromDB(form) {

    var values = {};
    var lastName = "";
    var firstName = "";

    var $inputs = $(form).filter(':input');

    $inputs.each(function() {
        if(this.name) {
            if(this.name === 'patient_last') {
                lastName = $(this).val().toUpperCase();
            }
            else if (this.name === 'patient_first') {
                firstName = $(this).val().toUpperCase();
            }
            else {
                values[this.name] = $(this).val();
            }

        }
    });

    values['patient'] = lastName + ', ' + firstName;

	fileTable.DeleteItem({
		ExpressionAttributeValues: {
			":hashval": {"S": values['patient']},
			":rangeval": {"N": values['apptDate']}
		}
	});
}

/**
	Checks if the userkey equals the login key stored on the server

	@param: socket; socket.io connection; should have socket.userkey has sub param
	@param: userKey; string; 
*/
function checkUserKey(socket, userKey) { 
	console.log("CHECKING")
	if(userKey === socket.userKey)
		return true;
	else
		return false;
}


/**
	Generic error reply function. Sends a message to a socket with error as message header

	@param: socket; socket.io connection; connection to user who needs to see error
	@param: message; string; the message to send to the user
*/
function serverError(socket, message) {
	socket.emit('serverToClient',{
		name: 'Error',
		message: message
	});
}

/**
	Generally handles all client requests from a socket. Takes incoming requests, parses by name, and runs necessary checks
	on function inputs before sending data to the requested function. 

	@param: socket; socket.io connection; the connection to the client sending data
	@param: incomingObj; obj; data sent from client
*/
function serverHandler(socket, incomingObj, callback) {
	//Login pipe
	if(incomingObj.name === 'login') {

		loginTools.loginUser(socket, userTable, fileTable, incomingObj, function(data, err, key) {
			if(data && data.userKey) {
				socket.userKey = data.userKey.S;
				callback(data, err, key);
			} 
			else {
				callback(null, {message: "Username or password incorrect"}, "appError")
			}
		});

	}
	//Post login
	else if(incomingObj.userKey) {

		if(!checkUserKey(socket, incomingObj.userKey)) {
			console.log(socket.userKey)
			console.log(incomingObj.userKey)
			callback(null, {name: 'loginFailure', message: "Userkey incorrect, command failed"})
		}

		//store data
		if(incomingObj.name === 'store') {
			storageTools.storeData(socket, incomingObj, fileTable, io, callback);
		}
		//pull data
		else if(incomingObj.name === 'retrieve') {
			storageTools.retrieveData(socket, incomingObj, fileTable, callback);
		}
		//logout
		else if(incomingObj.name === 'logout') {
			console.log("logout")
			socket.userKey = null; 

			callback();
		}
	}
	//Error pipe
	else {
		callback(null, {message: 'Login first/Name not recognized'}, 'appError');
	}
}

//On an io socket connection...
//Main
io.sockets.on('connection', function(socket) {
	console.log("CONNECTED")

	socket.on('disconnect', function() {
     	console.log('Got disconnect!');
   	});

	socket.on('clientToServer', function(data, callback) {
		if(!(data && data.name))
			serverError(socket, 'Data did not have a name');

		serverHandler(socket, data, callback);
	});

});