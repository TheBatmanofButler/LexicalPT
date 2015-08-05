/**
@author: Ganesh Ravichandran
@`: 8-1-15
@version: 0.1

Set up for selection box widget
*/

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function DateSorter(dateArray) {
	for (each_date in dateArray) {
		console.log(new Date(parseInt(dateArray[each_date])));
	}
}

function PatientDateInput(IncomingData) {
	var PatientData = {['']:['']}
	var DateData = ['']
	$.each(IncomingData.Items, function() {
		t_ms = this['apptDate']['N']
		patientName = this['patient']['S'].capitalize()

		var t_utc = new Date(parseInt(t_ms)+14400000);
		var t_formatted = t_utc.toDateString();

		if (patientName in PatientData) {
			PatientData[patientName].push(t_formatted);
		} else {
			PatientData[patientName] = [t_formatted];
		}

		DateData.push(t_ms);
	});

	DateSorter(DateData);

	$("#patient_combobox").select2({
		placeholder: "Select a Patient",
		data: Object.keys(PatientData).sort()
	});
	DateSorter(DateData);
	$("#date_combobox").select2({
		placeholder: "Select a Date",
		data: DateData
	});

	// var dateList = []
	// for (key in IncomingData) {
	//			 dateList.push(Date(IncomingData[key]));
	//		 }

	// $("#date_combobox").select2({
	//	 placeholder: "Select a Date",
	//	 data: [dateList]
	// });

	$("#patient_combobox").change( function() {
		var $patientName = $("#patient_combobox").val();

		var dateData = [];
		for (var date in PatientData[$patientName]) {
				dateData.push(PatientData[$patientName][date]);
			}
		if (dateData.length > 1 && $("#date_combobox").val() == '') {
			dateData.unshift('');
		}
        $("#date_combobox").children().remove().end();
		$("#date_combobox").select2({
			placeholder: "Select a Date",
			data: dateData
		});

		if ($("#date_combobox").val() != '') {
			$("#patient_combobox, #date_combobox").prop( "disabled", true );
			console.log('aaaaaa2');
            var human_date = new Date($("#date_combobox").val());
            console.log('bbbbbb2');
            var machine_date = human_date.getTime();
            console.log('cccccccc2', $("#patient_combobox").val(), String(machine_date));
            loadFormFromDB(patient = $("#patient_combobox").val(), apptDate = String(machine_date));
            console.log('dddddddd2');
			$("#queryResetButton").show();
		}

	});

	$("#date_combobox").change( function() {
		var $patientDate = $("#date_combobox").val();

		var patientData = [];
		for (var patientName in PatientData) {
				if (PatientData[patientName].indexOf($patientDate) >= 0) {
					patientData.push(patientName);
				}
			}
		if (patientData.length > 1 && $("#patient_combobox").val() == '') {
			patientData.unshift('');
		}
        $("#patient_combobox").children().remove().end();
		$("#patient_combobox").select2({
			placeholder: "Select a Patient",
			data: patientData
		});

		if ($("#patient_combobox").val() != '') {
			$("#patient_combobox, #date_combobox").prop( "disabled", true );
            console.log('aaaaaa');
            var human_date = new Date($("#date_combobox").val());
            console.log('cccccc');
            var machine_date = human_date.getTime();
            console.log('bbbbb');
            loadFormFromDB(patient = $("#patient_combobox").val(), apptDate = String(machine_date));
            console.log('asdfadsf');
			$("#queryResetButton").show();
		}

	});

    $("#queryResetButton").click( function() {  

        $("#patient_combobox").children().remove().end();
        $("#patient_combobox").select2({
            placeholder: "Select a Patient",
            data: Object.keys(PatientData).sort()
        });

        $("#date_combobox").children().remove().end();
        $("#date_combobox").select2({
            placeholder: "Select a Date",
            data: DateData
        });

        $("#patient_combobox, #date_combobox").prop( "disabled", false );
        $("#queryResetButton").hide();
    });

}