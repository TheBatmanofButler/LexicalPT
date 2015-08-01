function PatientDateInput(IncomingData) {

  var PatientData = {}
  $.each(IncomingData.Items, function() {
    PatientData[this['patient']['S']] = [this['apptDate']['N']];
  });

  $("#patient_combobox").select2({
    placeholder: "Select a Patient",
    data: Object.keys(PatientData)
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
        t_ms = PatientData[$patientName][date];
        var t_utc = new Date(parseInt(t_ms));
        dateData.push(t_utc.toDateString());
      }

    $("#date_combobox").select2({
      data: dateData
    });
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