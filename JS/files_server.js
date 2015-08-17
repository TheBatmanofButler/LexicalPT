/**
@author: Amol Kapoor
@date: 8-16-15
@version: 0.1

File manipulation functions directly related to the server
*/

/**
	Triggered on form submit, compiles the form into JSON and loads to server to db

    @param: form; string; id of form WITH a #
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
                lastName = $(this).val().toUpperCase();
            }
            else if (this.name === 'patient_first') {
                firstName = $(this).val().toUpperCase();
            }
            else {
                values[this.name] = $(this).val();
            }
        }
    });

    var storeDateString = values['apptDate'];

    values['apptDate'] = new Date(Date.parse(values['apptDate'])).getTime();

    values['patient'] = lastName + ', ' + firstName;

	socket.emit("clientToServer", values,
		function(data, err, isAppError) {
		if(err) {
			errorHandler(err, isAppError);
		} 
		else {
            postSubmit();
            delete changedFormIDs[form];
		}
	});
}

/**
    Loads changed forms to the database

    @param: callback; function() -- called if there are no errors in the form check
*/
function loadChangedFormsToDB(callback) {

    var callCallback = true;

    for(idIndex in changedFormIDs) {

        if(!checkFormErrors(idIndex)) {
            callCallback = false;
            continue;
        }

        $(idIndex).submit();
    }

    if(callback && callCallback) {
        callback();
    }
}

/**
    Takes in data and creats an actual form with that data.

    This is messy, needs to be cleaned. 

    @param: data; [] of objects like {}
    @param: noExtraForm; bool; whether or not to add a form at the end of the load
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
        var currentDate = new Date(new Date().getTime() - new Date().getTimezoneOffset()*60000).toISOString().substring(0,10);

        if( lastDate !== currentDate && !noExtraForm) {
            createForm();
            
            //Copy in the settings
            $('#form-' + global_formCount + ' .patient_last').val($('#form-' + (global_formCount - 1) + ' .patient_last').val());
            $('#form-' + global_formCount + ' .patient_first').val($('#form-' + (global_formCount - 1) + ' .patient_first').val());

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
            $('.next-five, .prev-five').fadeIn();
        });

        $('html, body').animate({
                scrollTop: $("#BreakOne").offset().top
        }, 400);
    });
}

/**
	Triggered on form request, (currently) prompts for patient name and apptDate 	

    @param: patient; string; patient name
    @param: apptDate; int; milliseconds of the day being saved
    @param: reverseOrder; bool; whether to pull next or last 5 dates (default is previous)
    @param: noExtraForm; bool; whether to add a form at the end of the load
*/
function loadFormFromDB(patient,apptDate, reverseOrder, noExtraForm) {
    var datetime = new Date(apptDate).getTime() + "";

    socket.emit("clientToServer", {
        name: 'retrieve',
        userKey: global_userKey,
        patient: patient,
        apptDate: datetime, 
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
