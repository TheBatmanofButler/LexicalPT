/**
@author: Amol Kapoor
@date: 7-20-15
@version: 0.1

File storage module
*/

//AWS dependency - not sure if needed? 
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';

function incomingObjType(incomingObj) {

	if (typeof incomingObj.hashval === "string") {
		var hashvalArg = {"S": incomingObj.hashval};
	} else if (typeof incomingObj.hashval === "number") {
		var hashvalArg = {"N": incomingObj.hashval + ""};
	}

	if (typeof incomingObj.rangeval === "string") {
		var rangevalArg = {"S": incomingObj.rangeval};
	} else if (typeof incomingObj.rangeval === "number") {
		var rangevalArg = {"N": incomingObj.rangeval + ""};
	}

	return [hashvalArg, rangevalArg];
}

//Exposed functions
module.exports = {

	/**
		Stores patient data to dynamo. 

		@param: incomingObj
			@param: apptTime; time in milliseconds from epoch
			@paraM: patient; string; patientname
		@param: table; where to store
		@param: callback; what to do after
	*/
	storeData: function(incomingObj, table, callback) {
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
			}
	    });
	},

	/**
		Retrieves data of a specific user using table.query
		Pulls down last 5 days in order of most recent

		@param: incomingObj; {}
			@param: patient; string; the patient name (hash)
		@param: table; dynamo db table; where to get data
		@param: callback; function(data, err)
	*/
	retrieveData: function(incomingObj, table, callback) {

		var valArg = incomingObjType(incomingObj);
		var hashvalArg = valArg[0];
		var rangevalArg = valArg[1];

		if (rangevalArg) {
			table.query({
				ScanIndexForward: false,
				ExpressionAttributeValues: {
					":hashval": hashvalArg,
					":rangeval": rangevalArg
				},
				KeyConditionExpression: table['hashname'] + " = :hashval"
			}, function(err, data)  {

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
		} else {
			table.query({
				ScanIndexForward: false,
				ExpressionAttributeValues: {
					":hashval": hashvalArg
				},
				KeyConditionExpression: table['hashname'] + " = :hashval"
			}, function(err, data)  {

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
	},

	/**
		Deletes data from the requested table

		@param: incomingObj;
			@param: patient; hash value for db
			@param: apptDate; range value for db
		@param: table; where to search
		@param: callback; function(data, err)
	*/
	deleteData: function(incomingObj, table, callback) {

		var valArg = incomingObjType(incomingObj);
		var hashvalArg = valArg[0];
		var rangevalArg = valArg[1];

		var tableHash = table['hashname'];
		var tableRange = table['rangename'];

		var itemParams = {};
		itemParams[tableHash] = hashvalArg;
		itemParams[tableRange] = rangevalArg;

		table.deleteItem({
			Key: itemParams,
			ExpressionAttributeValues: {
				":hashval": hashvalArg,
			},
			ConditionExpression: tableHash + " = :hashval"

		}, function(err) {
			console.log(err);
			if(err) {
				callback(null, err);
			}
			else {
				callback();
			}
		});
	},

	/**
		Closes a patient injury and moves the data to an archive table

		@param: incomingObj; obj;
			@param: patient; string
		@param: dataTable; where to delete data from
		@param: archiveTable; where to move data to
		@param: callback; function(data, err, key); data is always null
	*/
	archiveData: function(incomingObj, dataTable, archiveTable, callback) {

		var thisInstance = this;

		thisInstance.retrieveData(incomingObj, dataTable, function(data, err) {
			if(err) {
				callback(null, err);
			}
			else if(data) {
				var closeTime = new Date().getTime() + "";

				var promiseArray = [];

				for(var formIndex in data) {

					promiseArray.push(new Promise(function(resolve, reject) {

						data[formIndex]['closeDate'] = {N: closeTime};

						var itemParams = {Item: data[formIndex]};

						archiveTable.putItem(itemParams, function(err, callbackData) {
							if(err) {
								reject();
							}
							else {
								resolve();
							}
					    });

					}));
					
				}

				Promise.all(promiseArray).then(function() {

					promiseArray = [];

					for(var formIndex in data) {
						promiseArray.push(new Promise(function(resolve, reject) {

							var deleteObj = {}
							deleteObj['hashval'] = data[formIndex].patient.S;
							deleteObj['rangeval'] = parseInt(data[formIndex].apptDate.N);

							thisInstance.deleteData(deleteObj, dataTable, function(err) {
								console.log(err);
								if(err) {
									reject();
								}
								else {
									resolve();
								}
							});
						}));
					}

					Promise.all(promiseArray).then(function() {
						callback();
					}).catch(function() {
						callback(null, {message: "Server Error on loading promises -- 2"});
					});
				}).catch(function() {
					callback(null, {message: "Server Error on loading promises"});
				});
			}
		});
	}
}
