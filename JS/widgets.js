function PatientDateInput(IncomingData) {

  var PatientData = {['']:['']}
  var DateData = ['']
  $.each(IncomingData.Items, function() {
    t_ms = this['apptDate']['N']
    patientName = this['patient']['S']

    var t_utc = new Date(parseInt(t_ms));
    var t_formatted = t_utc.toDateString()
    if (patientName in PatientData) {
      PatientData[patientName].push(t_formatted);
    } else {
      PatientData[patientName] = [t_formatted];
    }

    DateData.push(t_formatted);
  });

  $("#patient_combobox").select2({
    placeholder: "Select a Patient",
    data: Object.keys(PatientData)
  });

  $("#date_combobox").select2({
    placeholder: "Select a Date",
    data: DateData
    });

  // var dateList = []
  // for (key in IncomingData) {
  //       dateList.push(Date(IncomingData[key]));
  //     }

  // $("#date_combobox").select2({
  //   placeholder: "Select a Date",
  //   data: [dateList]
  // });

  $("#patient_combobox").change( function() {
    var $patientName = $("#patient_combobox").val();
    $("#date_combobox").children().remove().end();

    var dateData = [];
    for (var date in PatientData[$patientName]) {
        dateData.push(PatientData[$patientName][date]);
      }
    if (dateData.length > 1) {
      dateData.unshift('');
    }
    $("#date_combobox").select2({
      placeholder: "Select a Date",
      data: dateData
    });

    if ($("#patient_combobox").val() != '' && $("#date_combobox").val() != '') {
      $("#patient_combobox, #date_combobox").prop( "disabled", true );
      $("#queryResetButton").show();
    }

  });

  $("#date_combobox").change( function() {
    var $patientDate = $("#date_combobox").val();
    $("#patient_combobox").children().remove().end();

    var patientData = [];
    for (var patientName in PatientData) {
        if (PatientData[patientName].indexOf($patientDate) >= 0) {
          patientData.push(patientName);
        }
      }
    if (patientData.length > 1) {
      patientData.unshift('');
    }
    $("#patient_combobox").select2({
      placeholder: "Select a Patient",
      data: patientData
    });

  // if ($("#patient_combobox").val() != '' && $("#date_combobox").val() != '') {
  //   $("#patient_combobox, #date_combobox").prop( "disabled", true );
  //   $("#queryResetButton").show();
  // }

  // $("#queryResetButton").click( function() {

  //   $("#patient_combobox").val('');
  //   $("#patient_combobox").select2({
  //     placeholder: "Select a Patient",
  //     data: Object.keys(PatientData)
  //   });

  //   $("#date_combobox").val('');
  //   $("#date_combobox").select2({
  //     placeholder: "Select a Date",
  //     data: DateData
  //   });

  //   $("#patient_combobox, #date_combobox").prop( "disabled", false );
  //   $("#queryResetButton").hide();
  // });

  });

  // $("#date_combobox").change( function() {
  //   console.log($("#date_combobox").val());
  // //   var $patientDate = $("#date_combobox").val();
  // //   $("#patient_combobox").children().remove().end();
  // //   $("#patient_combobox").select2({
  // //     data: $.each(IncomingData[$patientDate], function() {
  // //       [$(this)];
  // //     })
  // //   });
  // });

}