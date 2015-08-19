/**
@author: Amol Kapoor
@date: 8-16-15
@version: 0.1

File manipulation helper functions
*/

/**
    Attaches the handler for changes in the form

    @param: formId; string; the id of the form WITH a #
*/
function attachSubmitHandler(formId) {

   $(formId).change(function() {

        if(!changedFormIDs['#' + $(this).attr('id')]) {
            var deferred = new $.Deferred();

            changedFormIDs['#' + $(this).attr('id')] = deferred;

            global_deferredArray.push(deferred);
        }
        
    });
}

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
    Searches a form for basic errors regarding patient name and date, and prompts user if errors are found

    @param: form; string; id of form WITH a # 
*/
function checkFormErrors(form) {

    var date = new Date($(form + " .apptDate").val());

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

    if(Patient2Date[name] && name != currentPatient) {

        for(var index in Patient2Date[name]) {

            if(date.getTime() === parseInt(Patient2Date[name][index])) {

                if(confirm("Patient is already in the database. Saving may overwrite previous data. Continue?")) {
                    break;
                }
                else {
                    return false;
                }
            } 

        }
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
        currentPatient = "";
        firstDateLoaded = "";
        lastDateLoaded = "";

        if(callback) {
            callback();
        }
    });
}


/**
    Creates a form and increases the global form count by one

    @param: noDate; bool; whether or not to copy the date value in
*/
function createForm(noDate) {
    global_formCount++;

    var globalCount = global_formCount;

    var $form = $("#form-default").clone(true);

    $form.attr("id","form-" + globalCount);

    $form.removeClass("hidden");

    //Dynamic rows
    $form.find(".create-new-row-on-click").click(function() {
        createNewRow(this);
    });

    if(!noDate)
        $form.find(".apptDate").val(new Date(new Date().getTime() - new Date().getTimezoneOffset()*60000).toISOString().substring(0, 10));

    $form.find(".apptDate").change(function() {
        var dateString = $(this).val();
        var dateTime = new Date(dateString).getTime() + "";

        for(var i in Patient2Date[currentPatient]) {
            if(Patient2Date[currentPatient][i] === dateTime) {
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

    if(globalCount > 0) 
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
         
        $(".forms").animate({ scrollLeft: scroll}, 0);

        $('#staticForm').change(function() {
            $('li[id^="form-"]').trigger('change');
        });
        attachSubmitHandler('#form-' + global_formCount);
        $(".tables").fadeIn(function () {
            $("#form-" + global_formCount + " .patient_last").focus();
        });

        $('html, body').animate({
            scrollTop: $("#BreakOne").offset().top
        }, 400);
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
        var oldId = $(this).attr('class');
        var idInfo = oldId.split('-');

        $(this).val("");

        var newId = idInfo[0] + '-' + (parseInt(idInfo[1]) + 1);
        $(this).attr('class', newId);
        $(this).attr('name', newId);
    });

    //Dynamic rows
    $newRow.click(function() {
        createNewRow(this);
    });

    $(table).append($newRow);
 }
