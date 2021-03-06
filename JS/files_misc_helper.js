/**
@author: Amol Kapoor
@date: 8-16-15
@version: 0.1

File manipulation helper functions. API. 
*/

String.prototype.isValidDate = function() {
    var IsoDateRe = new RegExp("^([0-9]{4})-([0-9]{2})-([0-9]{2})$");
    var matches = IsoDateRe.exec(this);
    if (!matches) return false;

    var composedDate = new Date(matches[1], (matches[2] - 1), matches[3]);

    return ((composedDate.getMonth() == (matches[2] - 1)) &&
          (composedDate.getDate() == matches[3]) &&
          (composedDate.getFullYear() == matches[1]));

}

/**
    Binds a focus warning to the metadata
*/
function bindWarning() {
    $('#staticForm :input').unbind('focus');

    $('#staticForm :input').focus(function() {
        var confirmBox = confirm("Are you sure you want to change the patient meta-data? This is critical information.");
        if (confirmBox) {
            $('#staticForm :input').unbind('focus');
            $('li[id^="form-"]').trigger('change');
        } else {
            $(this).blur();
        }
    });
}

/**
    Attaches the handler for changes in the form

    @param: formId; string; the id of the form WITH a #
*/
function attachSubmitHandler(formId) {

   $(formId).change(function() {
        
        if(!changedFormIDs['#' + $(this).attr('id')]) {

            $(formId).closest("li").css('background', 'rgba(25, 250, 181, .25)');

            var deferred = new $.Deferred();

            changedFormIDs['#' + $(this).attr('id')] = deferred;

            global_deferredArray.push(deferred);
        }
        
    });
}

/**
    Searches a form for basic errors regarding patient name and date, and prompts user if errors are found

    @param: form; string; id of form WITH a # 
*/
function checkFormErrors(form) {

    var dateInput = $(form + " .apptDate").val();

    if(!dateInput.isValidDate()) {
        alert('Please enter a valid date in the format YYYY-MM-DD');
        return false;
    }

    var date = new Date(dateInput);

    var name = $(".meta-data .patient_last").val().toUpperCase() + ", " + $(".meta-data .patient_first").val().toUpperCase();

    //first some error checking 
    if(date.getTime() > new Date().getTime()) {
        alert("Date submitted is in the future, please select a different date: " + $(form + ".apptDate").val());
        return false;
    }

    if(name === ", ") {
        alert("There is no patient name submitted. Please submit a patient name before saving.");
        return false;
    }

    if(Patient2Date[name] && name != global_patientInfo.currentPatient) {
       alert("Patient is already in the database. Please submit a new patient name.");
       return false;
    }


    return true;
}

/**
    Removes all forms and sets global_formCount to -1. 

    @param: callback; function()
*/
function removeForms(callback) {
    if(Object.keys(changedFormIDs).length > 0 && global_userKey) {
        if(!confirm("You have unsaved changes. Do you want to continue?")) {
            return;
        }
    }

    $(".tables").fadeOut(function() {
        $("#CopyForward, .next-five, .prev-five").fadeOut();
        $(".multi-day-form-exercises-info-container").empty();
        $(".meta-data input").val("");
        global_formCount = -1;
        changedFormIDs = {};
        global_patientInfo.currentPatient = "";
        firstDateLoaded = "";
        lastDateLoaded = "";

        if(callback) {
            callback();
        }
    });
}

/**
    Takes a form DOM/jquery element and binds events to the elements inside it. Helper method to createForm()

    @param: $form; jquery form element
*/
function bindNewFormEvents($form) {

    //Dynamic rows
    $form.find(".create-new-row-on-click").click(function() {
        createNewRow(this);
    });

    $form.find(".apptDate").change(function() {
        var dateString = $(this).val();
        var dateTime = new Date(dateString).getTime() + "";

        for(var i in Patient2Date[global_patientInfo.currentPatient]) {
            if(Patient2Date[global_patientInfo.currentPatient][i] === dateTime) {
                alert("This date is already set for this patient. Please select another date.");
                $(this).val("");
            }
        }
    });

    $form.submit(function(event) {
        event.preventDefault(); 
        if(checkFormErrors("#" + $(this).attr("id"))) {
            loadFormToDB("#" + $(this).attr("id"));           
        }
        else {
            return;
        }

    });

    $form.change(function() {

        if(!changedFormIDs['#' + $(this).attr('id')]) {
            var deferred = new $.Deferred();

            $form.closest("li").css('background', 'rgba(25, 100, 181, .25)');

            changedFormIDs['#' + $(this).attr('id')] = deferred;

            global_deferredArray.push(deferred);
        }
        
    });

    return $form;
}

/**
    Creates a form and increases the global form count by one

    @param: noDate; bool; whether or not to copy the date value in
*/
function createForm(noDate) {
    global_formCount++;

    var $form = $("#form-default").clonePolyfill(true);

    $form.attr("id","form-" + global_formCount);

    $form.removeClass("hidden");

    if(!noDate)
        $form.find(".apptDate").val(new Date(new Date().getTime() - new Date().getTimezoneOffset()*60000).toISOString().substring(0, 10));

    $form = bindNewFormEvents($form);

    if(global_formCount > 0) 
        $("#CopyForward").fadeIn();

    $(".multi-day-form-exercises-info-container").append($form);

    $(".multi-day-form-exercises-info-container").fadeIn();
}


/**
    Helper method to actually call the create new form method
*/
function createNewForm() {
    removeForms(function() {
        createForm();
        $('#staticForm :input').unbind('focus');
         
        $('#staticForm').change(function() {
            $('li[id^="form-"]').trigger('change');
        });

        postCreateNewForm();
    });
}

/**
    Takes a DOMElement that represents a row, copies it and adds it to the document. Clears out the row on the copy.

    @param: DOMelement; DOM row; a row inside an HTML form - see HTML form structure
*/
function createNewRow(DOMelement) {
    var $newRow = $(DOMelement).clone();

    $(DOMelement).removeClass("create-new-row-on-click");
    $(DOMelement).unbind( "click" );

    var table = $(DOMelement).closest("table");

    $newRow.find('input').each(function(){

        var oldId =   $(this).attr("class").split(' ')[0];
        var idInfo = oldId.split('-');

        $(this).val("");

        var newId = idInfo[0] + '-' + (parseInt(idInfo[1]) + 1);
        $(this).removeClass(oldId);
        $(this).attr('class', newId + " " + $(this).attr('class'));
        $(this).attr('name', newId);
    });

    //Dynamic rows
    $newRow.click(function() {
        createNewRow(this);
    });

    $(table).append($newRow);
 }

function updateCurrentPatient() {
    global_patientInfo.currentPatient = $('.meta-data .patient_last').val().toUpperCase() + ", " + $('.meta-data .patient_first').val().toUpperCase();
}