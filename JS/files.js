/**
@author: Amol Kapoor
@date: 7-29-15
@version: 0.1

File manipulation functions
*/

var global_formCount = 0;

function createForm() {
    var $form = $("#form-default").clone();

    $form.attr("id","form-" + global_formCount);

    $form.removeClass("hidden");

    global_formCount++;
    
    $(".multi-day-form-exercises-info-container").append($form);
}

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

    values['apptDate'] = new Date(values['apptDate']).getTime();

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

    for(var i = 0; i < data.length; i++) {

        if(i > global_formCount - 1) {
            createForm();
        }

        for(classnames in data[i]) {      
            console.log(classnames);

            if(classnames === 'apptDate') {
                $("#form-" + i + " .apptDate").val(new Date(parseInt(data[i][classnames].N)).toISOString().substring(0, 10));
                continue;
            }

            console.log(data[i][classnames].S)

            console.log($("#form-" + i + " ." + classnames))

            $("#form-" + i + " ." + classnames).val(data[i][classnames].S);
        }
    }
	
    $(".tables").fadeIn();
}

/**
	Triggered on form request, (currently) prompts for patient name and apptDate 	
*/
function loadFormFromDB() {
	patient = prompt("PatientName?");
    apptDate = prompt("apptDate?");

    socket.emit("clientToServer", {
        name: 'retrieve',
        userKey: global_userKey,
        patient: patient,
        apptDate: apptDate
    }, function(data, err, appError) {
      if(err) {
        errorHandler(err, appError);
      }   
      else {
        _loadFormFromDB(data);
      }    
    });
}

