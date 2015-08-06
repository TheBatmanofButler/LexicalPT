/**
@author: Ganesh Ravichandran
@`: 8-1-15
@version: 0.1

Set up for selection box widget
*/

/**
	Does what you think: capitalizes the first letter of the string
*/
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

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
			@param: apptDate; string; dates of apointments
			@param: patient; string; names of patients
*/
function PatientDateInput(IncomingData) {
	console.log(IncomingData.Items);

	//Generates objects of patient keys -> date values, and date keys -> patient values
	var Patient2Date = {}
	var Date2Patient = {}
	for (var item in IncomingData.Items) {
		
		// time in UTC milliseconds
		var tMS = IncomingData.Items[item]['apptDate']['N']

		// capitalized patient name
		var patientName = IncomingData.Items[item]['patient']['S'].capitalize()

		// populate Patient2Date
		if (patientName in Patient2Date) {
			Patient2Date[patientName].push(tMS);
		} else {
			Patient2Date[patientName] = [tMS];
		}

		// populate Date2Patient
		if (tMS in Date2Patient) {
			Date2Patient[tMS].push(patientName);
		} else {
			Date2Patient[tMS] = [patientName];
		}
	}

	// populate patient combobox
	patientList = Object.keys(Patient2Date).sort()
	patientList.unshift('');
	$("#patient_combobox").select2({
		placeholder: "Select a Patient",
		data: patientList
	});

	// populate date combobox
	dateList = UTC2stringDate(Object.keys(Date2Patient).sort().reverse())
	dateList.unshift('');
	$("#date_combobox").select2({
		placeholder: "Select a Date",
		data: dateList
	});

	$("#patient_combobox").change( function() {
		var $patientName = $("#patient_combobox").val();

		if ($("#date_combobox").val() == '') {

			// remove children
	        $("#date_combobox").children().remove().end();

			// repopulate date combobox
	        var dateList = UTC2stringDate(Patient2Date[$patientName]).sort().reverse()
	        if (dateList.length > 1) {
	        	dateList.unshift('');
	        }
			$("#date_combobox").select2({
				placeholder: "Select a Date",
				data: dateList
			});
		}

		if ($("#date_combobox").val() != '' || Patient2Date[$patientName].length == 1) {
			$("#patient_combobox, #date_combobox").prop( "disabled", true );
			var $patientDate = stringDate2UTC($("#date_combobox").val())
            loadFormFromDB(patient = $patientName, apptDate = String($patientDate));
			$("#queryResetButton").show();
			console.log('blergg')
		}

	});

	$("#date_combobox").change( function() {
		var $patientDate = $("#date_combobox").val();

		if ($("#patient_combobox").val() == '') {

			// remove children
	        $("#patient_combobox").children().remove().end();

	        // repopulate patient combobox
	        var patientList = Date2Patient[stringDate2UTC([$patientDate])].sort()
	        if (patientList.length > 1) {
	        	patientList.unshift('');
	        }
			$("#patient_combobox").select2({
				placeholder: "Select a Patient",
				data: patientList
			});
		} 

		if ($("#patient_combobox").val() != '' || Date2Patient[stringDate2UTC([$patientDate])].length == 1) {
			$("#patient_combobox, #date_combobox").prop( "disabled", true );
			var $patientName = $("#patient_combobox").val()
            loadFormFromDB(patient = $patientName, apptDate = String(stringDate2UTC($patientDate)));
			$("#queryResetButton").show();
			console.log('blergg2')
		}

	});

    $("#queryResetButton").click( function() {

		// // populate patient combobox
		$("#patient_combobox").children().remove().end();
		patientList = Object.keys(Patient2Date).sort()
		patientList.unshift('');
		$("#patient_combobox").select2({
			placeholder: "Select a Patient",
			data: patientList
		});

		// populate date combobox
		$("#date_combobox").children().remove().end();
		dateList = UTC2stringDate(Object.keys(Date2Patient).sort().reverse())
		dateList.unshift('');
		$("#date_combobox").select2({
			placeholder: "Select a Date",
			data: dateList
		});

        $("#patient_combobox, #date_combobox").prop( "disabled", false );
        $("#queryResetButton").hide();
    });

}
