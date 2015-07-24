//AWS
//export AWS_ACCESS_KEY_ID
//export AWS_SECRET_ACCESS_KEY


var AWS = require('aws-sdk');
var loginTools = require('./loginTools');

//AWS config
AWS.config.region = 'us-east-1';
var userTable = new AWS.DynamoDB({params: {TableName: 'PTUsers'}});
var fileTable = new AWS.DynamoDB({params: {TableName: 'PTClientData'}});

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
	Stores patient data to dynamo. 

	@param: socket; the user connection
	@param: incomingObj
		@param: timestamp; time in milliseconds from epoch
		@param: '0-0', '1-5', etc.; coordinates keyed to values stored in tables
	@param: table; where to store
	@param: callback; what to do after
*/
function storeData(socket, incomingObj, table, callback) {
	var dataObj = {};

	for(key in incomingObj) {
		if(key === 'name')
			continue;

		if(key === 'timestamp') {
			dataObj[key] = {'N':incomingObj[key]};
		}
		else {
			dataObj[key] = {'S':incomingObj[key]};
		}
	}
	
	var itemParams = {Item: dataObj};

	table.putItem(itemParams, function(err, data) {
		if(err) {
			callback(null, err);
		}
		else {
			callback(dataObj);
		}
    });
}

/**
	Generally handles all client requests from a socket. Takes incoming requests, parses by name, and runs necessary checks
	on function inputs before sending data to the requested function. 

	@param: socket; socket.io connection; the connection to the client sending data
	@param: incomingObj; obj; data sent from client
*/
function serverHandler(socket, incomingObj, callback) {
	if(incomingObj.name === 'store') {

		if(loginTools.checkUserKey(incomingObj['userKey']))
			storeData(socket, incomingObj, fileTable, callback);

	}
	else if(incomingObj.name === 'login') {

		if(!isSanitized(incomingObj.username)) {
			serverError(socket, "No or invalid username");
			return;
		}

		if(!isSanitized(incomingObj.password)) {
			serverError(socket, "No or invalid password");
			return;
		}

		loginTools.loginUser(socket, userTable, incomingObj, callback);
	}
	else if(incomingObj.name === 'newUser') {

		if(!isSanitized(incomingObj.username)) {
			serverError(socket, "No or invalid username");
			return;
		}

		if(!isSanitized(incomingObj.password)) {
			serverError(socket, "No or invalid password");
			return;
		}

		var testEmail = incomingObj.email.replace('@', '').replace('.', '');
		if(!isSanitized(testEmail)) {
			serverError(socket, "No or invalid email");
			return;
		}

		loginTools.regNewUser(socket, userTable, incomingObj, callback);
	}
	else {
		serverError(socket, 'No Name match');
	}
}

//On an io socket connection...
//Main
io.sockets.on('connection', function(socket) {
	console.log("CONNECTED")
	socket.on('clientToServer', function(data, callback) {
		if(!(data && data.name))
			serverError(socket, 'Data did not have a name');

		serverHandler(socket, data, callback);
	});

});