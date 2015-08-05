/**
@author: Amol Kapoor
@date: 7-29-15
@version: 0.1

File manipulation functions
*/

var global_formCount = -1;

function removeForms(callback) {
    $(".multi-day-form-exercises-info-container, #CopyForward").fadeOut(function() {
        $(".multi-day-form-exercises-info-container").empty();
        global_formCount = -1;

        if(callback)
            callback();
    });
}

function createForm() {

    global_formCount++;

    var globalCount = global_formCount;

    var $form = $("#form-default").clone(true);

    $form.attr("id","form-" + globalCount);

    $form.removeClass("hidden");
    
    $form.find(".data-form").submit(function(event) {
        event.preventDefault();
        loadFormToDB("#form-" + globalCount);
    });

    $form.find(".submit-data").click(function() {
        $form.find(".hidden-submit-data").click();
    });

    $form.find(".apptDate").val(new Date().toISOString().substring(0, 10));

    if(globalCount > 0) 
        $("#CopyForward").fadeIn();

    $(".multi-day-form-exercises-info-container").append($form);

    $(".multi-day-form-exercises-info-container").fadeIn();
}

/**
	Triggered on form submit, compiles the form into JSON and loads to server to db
*/
function loadFormToDB(form) {
    var $inputs = $(form +' :input');
    var values = {};
    values.name = "store";
    values.userKey = global_userKey;

    console.log($inputs);

    $inputs.each(function() {
        values[this.name] = $(this).val();
    });

    console.log(values['apptDate']);

    values['apptDate'] = new Date(Date.parse(values['apptDate']) + new Date().getTimezoneOffset()*60000).getTime();

    console.log(values) 

	socket.emit("clientToServer", values,
		function(data, err, isAppError) {
		if(err) {
			errorHandler(err, isAppError);
		} 
		else {
			alert("Success?")
		}
	});
}

function _loadFormFromDB(data) {

    removeForms(function() {
        for(var i = 0; i < data.length; i++) {

            if(i > global_formCount) {
                createForm();
            }

            for(classnames in data[i]) {      

                if(classnames === 'apptDate') {
                    $("#form-" + i + " .apptDate").val(new Date(parseInt(data[i][classnames].N)).toISOString().substring(0, 10));
                    continue;
                }

                $("#form-" + i + " ." + classnames).val(data[i][classnames].S);
            }
        }

        //creates empty form
        createForm();
    
        $(".tables").fadeIn();
        $('html, body').animate({
                scrollTop: $("#BreakOne").offset().top
        }, 400);
    });
}

/**
	Triggered on form request, (currently) prompts for patient name and apptDate 	
*/
function loadFormFromDB(patient,apptDate) {
	// patient = prompt("PatientName?");
 //    apptDate = prompt("apptDate?");

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

/**
    Copies all of the data from the last day to the current day
*/
function copyForward() {
    alert();
    if(global_formCount < 1)
        return;

    var prevFormCount = global_formCount - 1;
    $('#form-' + prevFormCount + ' :input').each(function(){
        var classes = $(this).attr("class")     
        classes = classes.split(" ");

        classes[0] = "." + classes[0];

        $("#form-" + global_formCount + " " + classes[0]).val($(this).val());
    });
}
 