/**
@author: Amol Kapoor
@date: 8-16-15
@version: 0.1

File manipulation functions for settings bar specifically
*/

/**
    Calls for the previous set of five forms from the server
*/
function loadPrevFive() {
    loadChangedFormsToDB();
    loadFormFromDB(currentPatient, firstDateLoaded, null, true);
}

/**
    Calls for the next set of five forms from the server
*/
function loadNextFive() {
    loadChangedFormsToDB();
    loadFormFromDB(currentPatient, lastDateLoaded, true)
}

/**
    Creates a new form for a specific patient and copies in the patient name, precautions, and diagnosis for the new form
*/
function createNewPatientForm() {
    createForm(true);
    attachSubmitHandler('#form-' + global_formCount);

    $('#form-' + global_formCount + ' .patient_last').val($('#form-' + (global_formCount - 1) + ' .patient_last').val());
    $('#form-' + global_formCount + ' .patient_first').val($('#form-' + (global_formCount - 1) + ' .patient_first').val());

    $('#form-' + global_formCount + ' .precautions').val($('#form-' + (global_formCount - 1) + ' .precautions').val());
    $('#form-' + global_formCount + ' .diagnosis').val($('#form-' + (global_formCount - 1) + ' .diagnosis').val());

    $(".multi-day-form-exercises-info-container").animate({ scrollLeft: $(".multi-day-form-exercises-info-container").width() + 500}, 400);
}

/**
    Copies all of the data from the last day to the current day
*/
function copyForward() {
    if(global_formCount < 1)
        return;

    $('#form-' + (global_formCount - 1) + ' :input').each(function(){

        if($(this).val()) {
            var classes = $(this).attr("class")     
            classes = classes.split(" ");

            if(classes[0] !== 'apptDate') {
                openFormData("#form-" + global_formCount, classes[0], $(this).val());  
            }
        }
    });
}