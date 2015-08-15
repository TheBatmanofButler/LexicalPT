/**
	@author: Amol Kapoor
	@date: 8-15-15
	@version: 0.1

	Description: Monitor that hooks into node socket and sends an alert the moment the socket dies
*/


var nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
	service: 'gmail',
    auth: {
        user: 'jagservermonitor@gmail.com',
        pass: 'diagraphictech'
    }
});

var io = require('socket.io/node_modules/socket.io-client');

var socket = io('http://54.86.173.127:4000')

socket.on('connect', function () { console.log("socket connected"); });
socket.on('disconnect', function() { 

	console.log("SERVER DOWN")

	var subject = "JAG server is down";
	var message = "Jag server went down at " + new Date().toISOString();

	transporter.sendMail({
	    from: 'jagservermonitor@gmail.com',
	    to: 'theahura@gmail.com',
	    subject: subject,
	    text: message
	});

	transporter.sendMail({
	    from: 'jagservermonitor@gmail.com',
	    to: 'gr2483@columbia.edu',
	    subject: subject,
	    text: message
	});

	transporter.sendMail({
	    from: 'jagservermonitor@gmail.com',
	    to: 'mhemani96@gmail.com',
	    subject: subject,
	    text: message
	});
});

