function PatientDateInput(FakePatients) {
  $("#patient_combobox").select2({
    placeholder: "Select a Patient",
    data: Object.keys(FakePatients)
  });

  var dateList = []
  for (key in FakePatients) {
        dateList.push(Date(FakePatients[key]));
      }

  $("#date_combobox").select2({
    placeholder: "Select a Date",
    data: [dateList]
  });

  $("#patient_combobox").change( function() {
    var $patientName = $("#patient_combobox").val();
    $("#date_combobox").children().remove().end();
    $("#date_combobox").select2({
      data:
        $.each(FakePatients[$patientName], function() {
          [Date($(this))];
        })
    });
  });

  $("#date_combobox").change( function() {
    console.log($("#date_combobox").val());
  //   var $patientDate = $("#date_combobox").val();
  //   $("#patient_combobox").children().remove().end();
  //   $("#patient_combobox").select2({
  //     data: $.each(FakePatients[$patientDate], function() {
  //       [$(this)];
  //     })
  //   });
  });

  // $( "#patient_combobox" ).autocomplete({
  //   FakePatients
  // });
  // $.each((FakePatients), function(index, PatientName) {   
  //   $('#patient_combobox')
  //     .append($("<option></option>")
  //     .attr("value",PatientName)
  //     .text(PatientName));
  // });
}