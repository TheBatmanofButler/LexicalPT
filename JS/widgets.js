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
			formattedArray.push(new Date(parseInt(UTCtime[eachTime])).toDateString());
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
		return dateConvert.getTime();
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

	// if date has not been selected yet
	if ($("#date_combobox").val() == '') {

		// remove children
        $("#date_combobox").children().remove().end();

		// repopulate date combobox
        var dateList = UTC2stringDate(Patient2Date[$patientName].sort().reverse());
        if (dateList.length > 1) {
        	dateList.unshift('');
        }
		$("#date_combobox").select2({
			placeholder: "Select a Date",
			data: dateList
		});
	}

	// if date has been selected or there is only one date for the selected patient
	if ($("#date_combobox").val() != '' || Patient2Date[$patientName].length == 1) {

		// disable comboboxes
		$("#patient_combobox, #date_combobox").prop( "disabled", true );

		// convert local date to utc
		var $patientDate = stringDate2UTC($("#date_combobox").val())

		// call form loading function
        loadFormFromDB(patient = $patientName, apptDate = String($patientDate));

        // show reset button
		$("#queryResetButton").fadeIn().css("display","inline-block");
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
        if (patientList.length > 1) {
        	patientList.unshift('');
        }
		$("#patient_combobox").select2({
			placeholder: "Select a Patient",
			data: patientList
		});
	} 

	// if patient has been selected or there is only one patient for the selected date
	if ($("#patient_combobox").val() != '' || Date2Patient[stringDate2UTC([$patientDate])].length == 1) {

		// disable comboboxes
		$("#patient_combobox, #date_combobox").prop( "disabled", true );

		// convert local date to utc
		var $patientName = $("#patient_combobox").val()
        
		// call form loading function
        loadFormFromDB(patient = $patientName, apptDate = String(stringDate2UTC($patientDate)));
		
        // show reset button
		$("#queryResetButton").show().css("display","inline-block");;
	}

});

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
    $("#queryResetButton").hide();
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