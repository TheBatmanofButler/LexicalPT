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
	storeData: function(socket, incomingObj, table, callback) {
		var dataObj = {};

		for(key in incomingObj) {
			if(key === 'name' || !incomingObj[key] || incomingObj[key] === '')
				continue;

			if(key === 'date') {
				dataObj[key] = {'N':incomingObj[key] + ""};
			}
			else {
				dataObj[key] = {'S':incomingObj[key]};
			}
		}
		
		var itemParams = {Item: dataObj};

		console.log(itemParams)

		table.putItem(itemParams, function(err, data) {
			if(err) {
				callback(null, err);
			}
			else {
				callback(dataObj);
			}
	    });
	},

	retrieveData: function(socket, incomingObj, table, callback) {
		console.log("check")

		table.getItem({Key: {'patient':{'S':incomingObj['patient']}, 'date':{'N':incomingObj['date']}}}, function(err, data)  {
			console.log(err)
			console.log(data)
			if(err) {
				callback(null, err);
			}
			else if(data.Item) {
				callback(data.Item);
			}
			else {
				callback(null);
			}
		});
	}
}
