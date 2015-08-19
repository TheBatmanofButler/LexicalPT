/**
@author: Ganesh Ravichandran
@`: 8-1-15
@version: 0.1

Set up for selection box widget
*/

//Objects that store combobox data
var Patient2Date = {}
var Date2Patient = {}

/**
	Converts a utc datetime to a string

	@param: UTCtime; date;

	@return: an array of strings for each part of the datetime
*/
function UTC2stringDate(UTCtime) {
	var formattedArray = [];
	for (var eachTime in UTCtime) {
		if (UTCtime[eachTime] != '') {
			formattedArray.push(new Date(parseInt(UTCtime[eachTime])).toUTCString().substring(0, 17));
		}
	}
	return formattedArray;
}

/**
	Converts a string to a utc datetime

	@param: stringDate; string
	@return: the stringdate in milliseconds 
*/
function stringDate2UTC(stringDate) {
	if (stringDate != '') {
		var dateConvert = new Date(stringDate)
		return dateConvert.getTime() - (dateConvert.getTimezoneOffset()*60000);
	}
}

/**
	Combobox class. Sets up the comboboxes with incoming data so they interact correctly. 

	@param: IncomingData; {}
		@param: .Items; {}
			@param: apptDate; string; dates of appointments
			@param: patient; string; names of patients
*/
function PatientDateInput(IncomingData) {
	// Generates objects of patient keys -> date values, and date keys -> patient values
	// global vars used in addNewFormData
	for (var item in IncomingData.Items) {
		
		// time in UTC milliseconds
		var tMS = IncomingData.Items[item]['apptDate']['N']

		// capitalized patient name
		var patientName = IncomingData.Items[item]['patient']['S']

		// populate Patient2Date

		// for patients with multiple appt dates
		if (patientName in Patient2Date) {
			// ensures same data is not duplicated
			if(Patient2Date[patientName].indexOf(tMS) == -1){
				Patient2Date[patientName].push(tMS);
			}
		} else {
			// for new patients
			Patient2Date[patientName] = [tMS];
		}

		// populate Date2Patient
		if (tMS in Date2Patient) {
			if(Date2Patient[tMS].indexOf(patientName) == -1){
				Date2Patient[tMS].push(patientName);
			}
		} else {
			Date2Patient[tMS] = [patientName];
		}
	}

	// populate patient combobox
	var patientList = Object.keys(Patient2Date).sort(function (a, b) {
	    return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	// append empty string to beginning of list so placeholder shows up
	patientList.unshift('');

	//create patient select2 combobox
	$("#patient_combobox").select2({
		placeholder: "Select a Patient",
		data: patientList
	});

	// populate date combobox (similar to patient combobox)
	var dateList = UTC2stringDate(Object.keys(Date2Patient).sort().reverse());

	dateList.unshift('');
	$("#date_combobox").select2({
		placeholder: "Select a Date",
		data: dateList
	});
}

/**
	Handles change event for patient combobox
*/
$("#patient_combobox").change( function() {
	var $patientName = $("#patient_combobox").val();

	// remove children
    $("#date_combobox").children().remove().end();

	// repopulate date combobox
    var dateList = UTC2stringDate(Patient2Date[$patientName].sort().reverse());

	$("#date_combobox").select2({
		placeholder: "Select a Date",
		data: dateList
	});

	// if date has been selected or there is only one date for the selected patient
	if ($("#date_combobox").val() != '' || Patient2Date[$patientName].length === 1) {
 		$("#queryResetButton").fadeIn().css("display","inline-block");
		$("#querySubmitButton").fadeIn().css("display","inline-block");
	}

});

/**
	Handles change event for date combobox
*/
$("#date_combobox").change( function() {
	var $patientDate = $("#date_combobox").val();

	// if patient has not been selected yet
	if ($("#patient_combobox").val() == '') {

		// remove children
        $("#patient_combobox").children().remove().end();

        // repopulate patient combobox
        var patientList = Date2Patient[stringDate2UTC([$patientDate])].sort(function (a, b) {
		    return a.toLowerCase().localeCompare(b.toLowerCase());
		})

		$("#patient_combobox").select2({
			placeholder: "Select a Patient",
			data: patientList
		});
	} 

	// if patient has been selected or there is only one patient for the selected date
	if ($("#patient_combobox").val() != '' || Date2Patient[stringDate2UTC($patientDate)].length === 1) {
 		$("#queryResetButton").fadeIn().css("display","inline-block");
		$("#querySubmitButton").fadeIn().css("display","inline-block");
	}

});

/**
	Handles form submission request
*/
$("#querySubmitButton").click( function() {
	var $patientName = $("#patient_combobox").val()
	var $patientDate = $("#date_combobox").val();
	
	$("#patient_combobox, #date_combobox").prop( "disabled", true );

	$('#CancelDelete').trigger('click');

	loadFormFromDB(patient = $patientName, apptDate = stringDate2UTC($patientDate));

	$("#querySubmitButton").fadeOut();
})

/**
	Handles click event for reset button
*/
$("#queryResetButton").click( function() {

	// remove all patient combobox choices
	$("#patient_combobox").children().remove().end();

	// sort (case insensitive) array of patient names
	var patientList = Object.keys(Patient2Date).sort(function (a, b) {
	    return a.toLowerCase().localeCompare(b.toLowerCase());
	})

	// append empty string to beginning of list so placeholder shows up
	patientList.unshift('');

	// repopulate patient combobox with complete patientList
	$("#patient_combobox").select2({
		placeholder: "Select a Patient",
		data: patientList
	});

	// remove all patient combobox choices
	$("#date_combobox").children().remove().end();

	// sort array of dates from newest to oldest
	var dateList = UTC2stringDate(Object.keys(Date2Patient).sort().reverse())

	// append empty string to beginning of list so placeholder shows up
	dateList.unshift('');

	// repopulate date combobox with complete dateList
	$("#date_combobox").select2({
		placeholder: "Select a Date",
		data: dateList
	});

	// re-enable comboboxes
    $("#patient_combobox, #date_combobox").prop( "disabled", false );

    // hide reset button
    $("#queryResetButton").fadeOut();
    $("#querySubmitButton").fadeOut();

});

/**
	Refreshes comboboxes with newly submitted form data

	@param: newData; {};
*/
function addNewFormData(newData) {

	// pull patient name and appointment date info from newData
	var patientName = newData.patient.S;
	var tMS = newData.apptDate.N;

	// populate Patient2Date
	// for patients with multiple appt dates
	if (patientName in Patient2Date) {
		// ensures same data is not duplicated
		if(Patient2Date[patientName].indexOf(tMS) == -1){
			Patient2Date[patientName].push(tMS);
		}
	} else {
		// for new patients
		Patient2Date[patientName] = [tMS];
	}

	// populate Date2Patient
	if (tMS in Date2Patient) {
		if(Date2Patient[tMS].indexOf(patientName) == -1){
			Date2Patient[tMS].push(patientName);
		}
	} else {
		Date2Patient[tMS] = [patientName];
	}

	// reset comboboxes
	$("#queryResetButton").trigger('click');
};

/**
	Refreshes comboboxes and removes deleted data
*/
function removeFormData(data) {

	if(data.apptDate) {
		var apptDate = data.apptDate

		//delete patient from date
		var index = Date2Patient[apptDate].indexOf(data.patient);
		Date2Patient[apptDate].splice(index, 1);

		//delete date from patient
		if(Patient2Date[data.patient] === 1)
			delete Patient2Date[data.patient];
		else {
			index = Patient2Date[data.patient].indexOf(apptDate);
			Patient2Date[data.patient].splice(index, 1);
		}
	}
	//Remove the patient from all dates
	else {
		for(var i in Patient2Date[data.patient]) {
			var date = Patient2Date[data.patient][i];
			var index = Date2Patient[date].indexOf(data.patient);
			Date2Patient[date].splice(index, 1);
		}

		//remove all dates from patients
		delete Patient2Date[data.patient];
	}

	// reset comboboxes
	$("#queryResetButton").trigger('click');
}