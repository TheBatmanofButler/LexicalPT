//AWS
//export AWS_ACCESS_KEY_ID
//export AWS_SECRET_ACCESS_KEY

var FakePatients = {
	"Trudie Hills":["1420444921","11420444921"],
	"Branden Pannell":["1420444922","11420444921"],
	"Beryl Gondek":["1420444923"],
	"Latricia Balas":["1420444924"],
	"Tawanna Fairman":["1420444925"],
	"Lanie Mckinny":["1420444926"],
	"Arica Hockman":["1420444927"],
	"Marivel Lamer":["1420444928"],
	"Maddie Westray":["1420444929"],
	"Maryrose Heier":["1420444930"],
	"Kandy Travis":["1420434921"],
	"Ladonna Yohn":["1420424921"],
	"Karima Mcadams":["1421444921"],
	"Ja Hedden":["1420444941"],
	"Elaine Baver":["1420454921"],
	"Caridad Najera":["1426444921"],
	"Hien Serpa":["1420444721"],
	"Drusilla Beech":["1428444921"],
	"Kathlene Hemsley":["1420444111"],
	"Dalila Merola":["1420444121"]
	}

var AWS = require('aws-sdk');
var loginTools = require('./loginTools');
var storageTools = require('./storageTools');


//AWS config
AWS.config.region = 'us-east-1';
var userTable = new AWS.DynamoDB({params: {TableName: 'PTUsers'}});
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
	if(incomingObj.name === 'login') {
		console.log('login');
		if(!isSanitized(incomingObj.username)) {
			serverError(socket, "No or invalid username");
			return;
		}

		if(!isSanitized(incomingObj.password)) {
			serverError(socket, "No or invalid password");
			return;
		}

		loginTools.loginUser(socket, userTable, incomingObj, function(data, err, key) {
			if(data && data.userKey) {
				socket.userKey = data.userKey.S;
				data.FakeNames = FakePatients;
				callback(data, err, key);
			}
		});
	}
	else if(incomingObj.name === 'comboboxes') {
		loginTools.populateComboboxes(socket, fileTable, incomingObj, callback);
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

		loginTools.regNewUser(socket, userTable, incomingObj, function(data, err, key) {
			if(data && data.userKey)
				socket.userKey = data.userKey.S;

			callback(data, err, key);
		});
	}
	else if(incomingObj.userKey && checkUserKey(socket, incomingObj.userKey)) {
		if(incomingObj.name === 'store') {
			storageTools.storeData(socket, incomingObj, fileTable, callback);
		}
		else if(incomingObj.name === 'retrieve') {
			console.log("check")
			storageTools.retrieveData(socket, incomingObj, fileTable, callback);
		}
		else if(incomingObj.name === 'logout') {
			socket.userKey = null; 

			callback();
		}
	}
	else {
		callback(null, {message: 'Login first'}, 'appError');
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