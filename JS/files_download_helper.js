/**
@author: Amol Kapoor
@date: 8-19-15
@version: 0.1

File manipulation helper functions for downloading data from server. API. 
*/


/**
    Loads form data for a given data field

    @param: formSelector; string; id of the form WITH a #
    @param: className; string; the class of the field WITHOUT a .
    @param: value; string; value to copy in 
*/
function openFormData(formSelector, className, value) {

    //If DOM element doesn't exist, we need to create it
    if (!$(formSelector + " ." + className).length) {
        var classInfo = className.split('-');

        for(var j = global_slotCount; j <= classInfo[1]; j++) {
            if(!$(formSelector + " ." + classInfo[0] + '-' + j).length) {
                var DOMelement = $(formSelector + " ." + classInfo[0] + '-' + (j - 1)).closest("tr");
                createNewRow(DOMelement);
            }
        }
    }

    $(formSelector + " ." + className).val(value);
}

/**
    Loops through a data object and loads all form data that is not related to meta data

    @param: data; obj;
*/
function loadFormData(data) {
    //load the rest of the data
    for(var i = 0; i < data.length; i++) {

        if(i > global_formCount) {
            createForm();
        }

        var inverseFormVal = data.length - i - 1;

        for(var classnames in data[inverseFormVal]) {
            if(classnames === 'apptDate') {

                $("#form-" + i + " .apptDate").val(new Date(parseInt(data[inverseFormVal][classnames].N)).toISOString().substring(0, 10));
            
            } else {
                openFormData(("#form-" + i), classnames, data[inverseFormVal][classnames].S);
            }  
        }
    
        attachSubmitHandler('#form-' + i);
    }     
}

/**
    Loads metadata from a data object

    @param: data; {}
        @param: patient; string; patient name in the form "FIRSTNAME, LASTNAME"
*/
function loadMetaData(data) {
    var nameInfo = data[0]['patient'].S.split(', ');

    $(".meta-data .patient_first").val(nameInfo[1]);
    $(".meta-data .patient_last").val(nameInfo[0]);

    if (data[0]['protocol_approved']) {
       $(".meta-data .protocol_approved").val(data[0]['protocol_approved'].S);
    } 
    
    if (data[0]['precautions']) {
        $(".meta-data .precautions").val(data[0]['precautions'].S);
    } 

    if (data[0]['diagnosis']) {
        $(".meta-data .diagnosis").val(data[0]['diagnosis'].S);
    }

    if (data[0]['doctorname']) {
        $(".meta-data .doctorname").val(data[0]['doctorname'].S);
    }
}