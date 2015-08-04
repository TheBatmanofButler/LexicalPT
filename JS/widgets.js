/**
@author: Ganesh Ravichandran
@`: 8-1-15
@version: 0.1

Set up for selection box widget
*/

function DateSorter(dateStringArray) {

    monthArray = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

    splitArray = []
    for (each_str in dateStringArray) {
        if (dateStringArray[each_str] != '') {
            splitArray.push(dateStringArray[each_str].split(" "));
        }
    }

    splitArray.sort(function compare(a,b) {
        if (a[3] < b[3]) {
            return -1;
        } else if (a[3] > b[3]) {
            return 1;
        } else {
            if (monthArray.indexOf(a[3]) < monthArray.indexOf(b[2])) {
                return -1;
            } else if (monthArray.indexOf(a[3]) > monthArray.indexOf(b[2])) {
                return 1;
            } else {
                if (a[2] < b[2]) {
                    return -1;
                } else if (a[2] > b[2]) {
                    return 1;
                }
            }
        }
        return 0;
    });

    returnableArray = []
    for (each_str in splitArray) {
        returnableArray.push(splitArray[each_str].join(' '));
    }
    returnableArray.unshift('');

    return returnableArray;

}

function PatientDateInput(IncomingData) {
	var PatientData = {['']:['']}
	var DateData = ['']
	$.each(IncomingData.Items, function() {
		t_ms = this['apptDate']['N']
		patientName = this['patient']['S']

		var t_utc = new Date(parseInt(t_ms)+14400000);
		var t_formatted = t_utc.toDateString();

		if (patientName in PatientData) {
			PatientData[patientName].push(t_formatted);
		} else {
			PatientData[patientName] = [t_formatted];
		}

		DateData.push(t_formatted);
	});

	$("#patient_combobox").select2({
		placeholder: "Select a Patient",
		data: Object.keys(PatientData).sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        })
	});
    DateSorter(DateData);
	$("#date_combobox").select2({
		placeholder: "Select a Date",
		data: DateSorter(DateData)
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
			data: DateSorter(dateData)
		});

		if ($("#date_combobox").val() != '') {
			$("#patient_combobox, #date_combobox").prop( "disabled", true );
            var human_date = new Date($("#date_combobox").val());
            var machine_date = human_date.getTime();
            console.log({patient: $("#patient_combobox").val(), apptDate: machine_date});
            loadFormFromDB(patient = $("#patient_combobox").val(), apptDate = String(machine_date));
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
			data: patientData.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            })
		});

		if ($("#patient_combobox").val() != '') {
			$("#patient_combobox, #date_combobox").prop( "disabled", true );
            var human_date = new Date($("#date_combobox").val());
            var machine_date = human_date.getTime();
            console.log($("#patient_combobox").val(), machine_date);
            loadFormFromDB(patient = $("#patient_combobox").val(), apptDate = String(machine_date));
			$("#queryResetButton").show();
		}

	});

	// $("#date_combobox").change( function() {
	//	 console.log($("#date_combobox").val());
	// //	 var $patientDate = $("#date_combobox").val();
	// //	 $("#patient_combobox").children().remove().end();
	// //	 $("#patient_combobox").select2({
	// //		 data: $.each(IncomingData[$patientDate], function() {
	// //			 [$(this)];
	// //		 })
	// //	 });
	// });
    $("#queryResetButton").click( function() {  

        $("#patient_combobox").children().remove().end();
        $("#patient_combobox").select2({
            placeholder: "Select a Patient",
            data: Object.keys(PatientData).sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            })
        });

        $("#date_combobox").children().remove().end();
        $("#date_combobox").select2({
            placeholder: "Select a Date",
            data: DateSorter(DateData)
        });

        $("#patient_combobox, #date_combobox").prop( "disabled", false );
        $("#queryResetButton").hide();
    });

}