function PatientDateInput(IncomingData) {
  console.log(IncomingData);
  console.log(IncomingData.fullname)
  PatientNames = IncomingData.fullname
  PatientNames = IncomingData.fullname
  alert("kkkk")
  $("#patient_combobox").select2({
    placeholder: "Select a Patient",
    data: Object.keys(IncomingData)
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
    $("#date_combobox").select2({
      data:
        $.each(IncomingData[$patientName], function() {
          [Date($(this))];
        })
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