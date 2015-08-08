/**
@author: Amol Kapoor
@date: 7-20-15
@version: 0.1

File storage module
*/

//AWS dependency - not sure if needed? 
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';


//Exposed functions
module.exports = {

	/**
		Stores patient data to dynamo. 

		@param: socket; the user connection
		@param: incomingObj
			@param: timestamp; time in milliseconds from epoch
			@param: '0-0', '1-5', etc.; coordinates keyed to values stored in tables
		@param: table; where to store
		@param: callback; what to do after
	*/
	storeData: function(socket, incomingObj, table, io, callback) {
		var dataObj = {};

		for(key in incomingObj) {
			if(key === 'name' || !incomingObj[key] || incomingObj[key] === '')
				continue;

			if(key === 'apptDate') {
				dataObj[key] = {'N':incomingObj[key] + ""};
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
				io.sockets.emit('serverToClient', dataObj);
			}
	    });
	},

	/**
		Retrieves data of a specific user using table.query
		Pulls down last 5 days in order of most recent

		@param: socket; socket.io connection; 
		@param: incomingObj; {}
			@param: patient; string; the patient name (hash)
			@param: apptDate; string; the date in milliseconds to search from
		@param: table; dynamo db table; where to get data
		@param: callback; function(data, err)
	*/
	retrieveData: function(socket, incomingObj, table, callback) {
		table.query({
			ScanIndexForward: true,
			Limit: 5,
			ExpressionAttributeValues: {
				":hashval": {"S": incomingObj['patient']},
				":rangeval": {"N": incomingObj['apptDate']}
			},
			KeyConditionExpression: "patient = :hashval AND apptDate <= :rangeval"
		}, function(err, data)  {
			console.log("callback")
			if(err) {
				callback(null, err);
			}
			else if(data.Items && data.Items.length > 0) {				
				callback(data.Items);
			}
			else {
				callback(null);
			}
		});
	}
}
