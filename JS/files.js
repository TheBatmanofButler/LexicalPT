/**
@author: Amol Kapoor
@date: 7-29-15
@version: 0.1

File manipulation functions
*/

/**
	Triggered on form submit, compiles the form into JSON and loads to server to db
*/
function loadFormToDB() {
    var $inputs = $('#DataForm :input');
    var values = {};
    values.name = "store";
    values.userKey = global_userKey;

    $inputs.each(function() {
        values[this.name] = $(this).val();
    });

	socket.emit("clientToServer", values,
		function(data, err, isAppError) {
		if(err) {
			errorHandler(err, isAppError);
		} 
		else {
			alert("Success?")
		}
	});
}

function _loadFormFromDB(data) {
	console.log(data);
	for(ID in data) {
		$("#" + ID).val(data[ID]);
	}
    $(".tables").fadeIn();
}

/**
	Triggered on form request, (currently) prompts for patient name and date 	
*/
function loadFormFromDB() {
	patient = prompt("PatientName?");
    date = prompt("date?");

    socket.emit("clientToServer", {
        name: 'retrieve',
        userKey: global_userKey,
        patient: patient,
        date: date
    }, function(data, err, appError) {
      if(err) {
        errorHandler(err, appError);
      }   
      else {
        _loadFormFromDB(data);
      }    
    });
}

