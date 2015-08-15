/**
@author: Amol Kapoor
@date: 7-29-15
@version: 0.1

File manipulation functions
*/

var global_formCount = -1;

var changedFormIDs = {};

var currentPatient = "";
var lastDateLoaded = "";
var firstDateLoaded = "";

//HELPER FUNCTIONS
function openFormData(formSelector, className, value) {

    //If DOM element doesn't exist, we need to create it
    if (!$(formSelector + " ." + className).length) {
        var classInfo = className.split('-');

        for(var j = 5; j <= classInfo[1]; j++) {
            if(!$(formSelector + " ." + classInfo[0] + '-' + j).length) {
                var DOMelement = $(formSelector + " ." + classInfo[0] + '-' + (j - 1)).closest("tr");
                createNewRow(DOMelement);
            }
        }
    }

    $(formSelector + " ." + className).val(value);
}

//SERVER FUNCTIONS
/**
	Triggered on form submit, compiles the form into JSON and loads to server to db
*/
function loadFormToDB(form) {
    //Set up basic server request
    var values = {};
    values.name = "store";
    values.userKey = global_userKey;

    var lastName = "";
    var firstName = "";

    //query the form, convert to object
    var $inputs = $(form +' :input');
    $inputs.each(function() {
        if(this.name) {
            if(this.name === 'patient_last') {
                lastName = $(this).val();
            }
            else if (this.name === 'patient_first') {
                firstName = $(this).val();
            }
            else {
                values[this.name] = $(this).val();
            }
        }
    });

    values['apptDate'] = new Date(Date.parse(values['apptDate']) + new Date().getTimezoneOffset()*60000).getTime();

    values['patient'] = lastName + ', ' + firstName;

	socket.emit("clientToServer", values,
		function(data, err, isAppError) {
		if(err) {
			errorHandler(err, isAppError);
		} 
		else {
            postSubmit();
		}
	});
}

/**
    Loads changed forms to the database
*/
function loadChangedFormsToDB() {
    for(idIndex in changedFormIDs) {
        loadFormToDB(idIndex);
    }
}

/**
    Takes in data and creats an actual form with that data.

    This is messy, needs to be cleaned. 

    @param: data; [] of objects like {}
*/
function _loadFormFromDB(data, noExtraForm) {
    //delete all previous forms
    removeForms(function() { 

        //load new ones
        for(var i = 0; i < data.length; i++) {

            if(i > global_formCount) {
                createForm();
            }

            var inverseFormVal = data.length - i - 1;

            for(classnames in data[inverseFormVal]) {
                if(classnames === 'apptDate') {

                    $("#form-" + i + " .apptDate").val(new Date(parseInt(data[inverseFormVal][classnames].N)).toISOString().substring(0, 10));
                
                } else if (classnames === 'patient') {
                    var nameInfo = data[inverseFormVal]['patient'].S.split(', ');

                    $("#form-" + i + " .patient_first").val(nameInfo[1]);
                    $("#form-" + i + " .patient_last").val(nameInfo[0]);

                } else {
                    openFormData(("#form-" + i), classnames, data[inverseFormVal][classnames].S);
                }  
            }

            attachSubmitHandler('#form-' + i);
        }
        
        //creates empty form if one for the current date DOESNT already exist
        var lastDate = new Date(parseInt(data[0]['apptDate'].N)).toISOString().substring(0,10);
        var currentDate = new Date().toISOString().substring(0,10);

        if( lastDate !== currentDate && !noExtraForm) {
            createForm();
            
            //Copy in the settings
            $('#form-' + global_formCount + ' .patient').val($('#form-' + (global_formCount - 1) + ' .patient').val());
            $('#form-' + global_formCount + ' .precautions').val($('#form-' + (global_formCount - 1) + ' .precautions').val());
            $('#form-' + global_formCount + ' .diagnosis').val($('#form-' + (global_formCount - 1) + ' .diagnosis').val());
        }

        //loads data for prevfive/nextfive
        currentPatient = data[0]['patient'].S;
        firstDateLoaded = parseInt(data[data.length - 1]['apptDate'].N);
        lastDateLoaded = parseInt(data[0]['apptDate'].N)

        //Binds enter key to dynamic form
        attachSubmitHandler('#form-' + global_formCount);

        //Animations
        $(".tables").fadeIn(function() {
            $(".multi-day-form-exercises-info-container").animate({ scrollLeft: $(".multi-day-form-exercises-info-container").width() + 500}, 400);
            $('#form-' + global_formCount + ' .patient_last').focus();
        });

        $('html, body').animate({
                scrollTop: $("#BreakOne").offset().top
        }, 400);
    });
}

/**
	Triggered on form request, (currently) prompts for patient name and apptDate 	
*/
function loadFormFromDB(patient,apptDate, reverseOrder, noExtraForm) {
    socket.emit("clientToServer", {
        name: 'retrieve',
        userKey: global_userKey,
        patient: patient,
        apptDate: apptDate, 
        reverseOrder: reverseOrder
    }, function(data, err, appError) {
        if(err) {
            errorHandler(err, appError);
        }   
        else {
            _loadFormFromDB(data, noExtraForm);
        }    
    });
}

function loadPrevFive() {
    loadChangedFormsToDB();
    loadFormFromDB(currentPatient, firstDateLoaded.toString(), null, true);
}

function loadNextFive() {
    loadChangedFormsToDB();
    loadFormFromDB(currentPatient, lastDateLoaded.toString(), true)
}

//LOCAL FUNCTIONS

/**
    Removes all forms and sets global_formCount to -1. 

    @param: callback; function()
*/
function removeForms(callback) {
    $(".tables").fadeOut(function() {
        $(".multi-day-form-exercises-info-container").empty();
        global_formCount = -1;
        changedFormIDs = {};

        if(callback)
            callback();
    });
}


/**
    Creates a form and increases the global form count by one
*/
function createForm() {

    global_formCount++;

    var globalCount = global_formCount;

    var $form = $("#form-default").clone(true);

    $form.attr("id","form-" + globalCount);

    $form.removeClass("hidden");

    //Dynamic rows
    $form.find(".create-new-row-on-click").click(function() {
        createNewRow(this);
    });


    $form.find(".apptDate").val(new Date().toISOString().substring(0, 10));

    $form.submit(function(event) {
        event.preventDefault(); 
        loadChangedFormsToDB();
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

/**
    Takes a DOMElement that represents a row, copies it and adds it to the document. Clears out the row on the copy.

    @param: DOMelement; DOM row; a row inside an HTML form - see HTML form structure
*/
function createNewRow(DOMelement) {
    var $newRow = $(DOMelement).clone();

    $(DOMelement).removeClass("create-new-row-on-click");
    $(DOMelement).unbind( "click" );

    table = $(DOMelement).closest("table");

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


function attachSubmitHandler(formId) {
   $(formId).change(function() {
        changedFormIDs['#' + $(this).attr('id')] = true;
    });
}