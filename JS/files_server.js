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

    //load meta-data first
    $('.meta-data :input').each(function() {
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

    //query the form, convert to object
    var $inputs = $(form +' :input');
    $inputs.each(function() {
        if(this.name) {
            values[this.name] = $(this).val();
        }
    });

    var storeDateString = values['apptDate'];

    values['apptDate'] = new Date(Date.parse(values['apptDate'])).getTime();

    values['patient'] = lastName + ', ' + firstName;

    currentPatient = values['patient'];

    $('#staticForm :input').unbind('focus');

    $('#staticForm :input').focus(function() {
        var confirmBox = confirm("Are you sure you want to change the patient meta-data? This is critical information.");
        if (confirmBox) {
            $('#staticForm :input').unbind('focus');
            $('li[id^="form-"]').trigger('change');
        }
    });

	socket.emit("clientToServer", values,
		function(data, err, isAppError) {
		if(err) {
			errorHandler(err, isAppError);
		} 
		else {
            postSubmit();
            var tempDeferred = changedFormIDs[form];
            delete changedFormIDs[form];
            tempDeferred.resolve();
		}
	});
}

/**
    Loads changed forms to the database

    @param: callback; function() -- called if there are no errors in the form check
*/
function loadChangedFormsToDB(callback) {

    var callCallback = true;

    for(var idIndex in changedFormIDs) {
        $(idIndex).submit();
    }

    $.when.apply($, global_deferredArray).then(function() {
        if(callback && callCallback) {
            callback();
        }
    });
}

/**
    Takes in data and creats an actual form with that data.

    This is messy, needs to be cleaned. 

    @param: data; [] of objects like {}
    @param: noExtraForm; bool; whether or not to add a form at the end of the load
*/
function _loadFormFromDB(data, noExtraForm, requestedDate) {
    //delete all previous forms
    removeForms(function() { 

        global_deferredArray = [];

        //Load the meta-data
        var nameInfo = data[0]['patient'].S.split(', ');

        $(".meta-data .patient_first").val(nameInfo[1]);
        $(".meta-data .patient_last").val(nameInfo[0]);

        if (data[0]['protocol-approved']) {
           $(".meta-data .protocol-approved").val(data[0]['protocol-approved'].S);
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

        //loads data for prevfive/nextfive
        currentPatient = data[0]['patient'].S;
        firstDateLoaded = parseInt(data[data.length - 1]['apptDate'].N);
        lastDateLoaded = parseInt(data[0]['apptDate'].N);   

        //Binds enter key to dynamic form
        attachSubmitHandler('#form-' + global_formCount);  

        //Animations
        $(".tables").fadeIn(function() {
            console.log(requestedDate)
            var length = Patient2Date[currentPatient].length;
            var index = length - Patient2Date[currentPatient].indexOf(requestedDate.toString()) - 1;
            var scroll = document.getElementById('Forms').scrollWidth/length * index;

            console.log(scroll)

            $(".forms").animate({ scrollLeft: scroll}, 400);

            //$('#form-' + global_formCount + ' .apptDate').focus();

            //get the ms number for the first and last dates that exist in the db
            var firstDateForPatient =  parseInt(Patient2Date[currentPatient][Patient2Date[currentPatient].length - 1]);
            var lastDateForPatient =  parseInt(Patient2Date[currentPatient][0]);

            if(firstDateLoaded > firstDateForPatient)
                $('.prev-five').fadeIn();

            if(lastDateLoaded < lastDateForPatient)
                $('.next-five').fadeIn();
        });
        


        $('html, body').animate({
                scrollTop: $("#BreakOne").offset().top
        }, 400);
    });

    $('#staticForm :input').unbind('focus');

    $('#staticForm :input').focus(function() {
        var confirmBox = confirm("Are you sure you want to change the patient meta-data? This is critical information.");
        if (confirmBox) {
            $('#staticForm :input').unbind('focus');
            $('li[id^="form-"]').trigger('change');
        }
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
            _loadFormFromDB(data, noExtraForm, apptDate);
        }    
    });
}



/** 
    Closes out a patient injury. Moves all of the data related to that patient to another table, and removes the patient 
    and all related dates from the combobox search list.  
*/
function closePatientInjury() {
    if(!confirm('Closing the patient injury will archive this data. Do you want to proceed?'))
        return;

    socket.emit("clientToServer", {
        name: 'closeInjury',
        patient: currentPatient,
        userKey: global_userKey
    }, function(data, err, key) {
        if(err) {
            errorHandler(err);
            return;
        }

        removeForms();
        $('html, body').animate({
            scrollTop: 0
        }, 400);
        $("#queryResetButton").click();
    });
}

