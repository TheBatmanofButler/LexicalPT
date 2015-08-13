/**
@author: Ganesh Ravichandran
@date: 8-6-15
@version: 0.1

Handles incoming/outgoing server connections
*/

socket.on('serverToClient', function(data) {
	if(!data.name) {
		errorHandler({message: 'No name, server data not sent'});
	}
	else {
		if(data.name === 'Error') {
			errorHandler(data.message);
		}
		else if (data.name === 'updateSearch') {
			addNewFormData(data);
		}
	}
});

socket.on('disconnect', function() {
	alert("Disconnected from server");
});