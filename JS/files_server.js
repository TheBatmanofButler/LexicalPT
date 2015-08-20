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

    var values = processForm(form);

    values.name = "store";
    values.userKey = global_userKey;

    global_patientInfo.currentPatient = values['patient'];

    bindWarning();

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
    @param: requestedDate; int
*/
function _loadFormFromDB(data, noExtraForm, requestedDate) {
    //delete all previous forms
    removeForms(function() { 

        global_deferredArray = [];

        //Load the meta-data
        loadMetaData(data);

        loadFormData(data);  

        //loads patient data
        global_patientInfo.currentPatient = data[0]['patient'].S;
        global_patientInfo.firstDateLoaded = parseInt(data[data.length - 1]['apptDate'].N);
        global_patientInfo.lastDateLoaded = parseInt(data[0]['apptDate'].N);   

        //Binds enter key to dynamic form
        attachSubmitHandler('#form-' + global_formCount);  

        //Animations
        postFormLoad(requestedDate);
    });

    bindWarning();
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
        hashval: patient,
        hashtype: "patient",
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
    Deletes a form. 

    @param: form; string; form id with hashtag
*/
function deleteForm(form) {

    var apptDate =  new Date(Date.parse($(form + " .apptDate").val())).getTime().toString();

    socket.emit("clientToServer", {
        name: "formDelete",
        patient: global_patientInfo.currentPatient,
        apptDate: apptDate, 
        userKey: global_userKey
    }, function(data, err, isAppError) {
        if(err) {
            errorHandler(err, isAppError);
        }
        else {
            $(form).remove();
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
        patient: global_patientInfo.currentPatient,
        userKey: global_userKey
    }, function(data, err, key) {
        if(err) {
            errorHandler(err);
            return;
        }

        postCloseInjury();
    });
}

