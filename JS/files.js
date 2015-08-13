/**
@author: Amol Kapoor
@date: 7-29-15
@version: 0.1

File manipulation functions
*/

var global_formCount = -1;

var changedFormIDs = {};

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

    //query the form, convert to object
    var $inputs = $(form +' :input');
    $inputs.each(function() {
        console.log(this.name)
        values[this.name] = $(this).val();
    });

    values['apptDate'] = new Date(Date.parse(values['apptDate']) + new Date().getTimezoneOffset()*60000).getTime();

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
    Takes in data and creats an actual form with that data

    @param: data; [] of objects like {}
*/
function _loadFormFromDB(data) {
    removeForms(function() { 
        for(var i = 0; i < data.length; i++) {

            if(i > global_formCount) {
                createForm();
            }

            for(classnames in data[i]) {
                if(classnames === 'apptDate') {
                    $("#form-" + i + " .apptDate").val(new Date(parseInt(data[i][classnames].N)).toISOString().substring(0, 10));
                }  
                else {
                    openFormData(("#form-" + i), classnames, data[i][classnames].S);
                }  
            }

            attachSubmitHandler('#form-' + i);
        }
        
        //creates empty form
        createForm();

        attachSubmitHandler('#form-' + global_formCount);

        $(".tables").fadeIn(function() {
            $(".multi-day-form-exercises-info-container").animate({ scrollLeft: $(".multi-day-form-exercises-info-container").width() + 500}, 400);
        });

        $('html, body').animate({
                scrollTop: $("#BreakOne").offset().top
        }, 400);
    });
}

/**
	Triggered on form request, (currently) prompts for patient name and apptDate 	
*/
function loadFormFromDB(patient,apptDate) {
    socket.emit("clientToServer", {
        name: 'retrieve',
        userKey: global_userKey,
        patient: patient,
        apptDate: apptDate
    }, function(data, err, appError) {
        if(err) {
            errorHandler(err, appError);
        }   
        else {
            _loadFormFromDB(data);
        }    
    });
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

    var d = new Date();

    $form.find(".apptDate").val(new Date(d.getTime() + d.getTimezoneOffset()*60000).toISOString().substring(0, 10));

    if(globalCount > 0) 
        $("#CopyForward").fadeIn();

    $(".multi-day-form-exercises-info-container").append($form);

    $(".multi-day-form-exercises-info-container").fadeIn();
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