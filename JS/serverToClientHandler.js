/**
@author: Ganesh Ravichandran
@date: 8-6-15
@version: 0.1

Handles incoming/outgoing server connections
*/

socket.on('serverToClient', function(data) {
	addNewFormData(data);
});