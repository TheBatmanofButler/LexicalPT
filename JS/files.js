/**
@author: Amol Kapoor
@date: 7-29-15
@version: 0.1

File manipulation functions
*/

var global_formCount = -1;

//SERVER FUNCTIONS
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

                if ($("#form-" + i + " ." + classnames).length) {
                    $("#form-" + i + " ." + classnames).val(data[i][classnames].S);
                }
                else {
                    var classInfo = classnames.split('-');

                    for(var j = 5; j <= classInfo[1]; j++) {
                        if(!$("#form-" + i + " " + classInfo[0] + '-' + j).length) {
                            var DOMelement = $("#form-" + i + " ." + classInfo[0] + '-' + (j - 1)).closest("tr");
                            createNewRow(DOMelement);
                        }
                    }

                    $("#form-" + i + " ." + classnames).val(data[i][classnames].S);
                }
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

//LOCAL FUNCTIONS
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

    //Dynamic rows
    $form.find(".create-new-row-on-click").click(function() {
        createNewRow(this);
    });

    $form.find(".apptDate").val(new Date().toISOString().substring(0, 10));

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

    var prevFormCount = global_formCount - 1;
    $('#form-' + prevFormCount + ' :input').each(function(){

        if($(this).val()) {
            var classes = $(this).attr("class")     
            classes = classes.split(" ");

            classes[0] = "." + classes[0];

            if(classes[0] !== 'apptDate') {

                if ($("#form-" + global_formCount + " " + classes[0]).length) {
                    $("#form-" + global_formCount + " " + classes[0]).val($(this).val());
                }
                else {
                    console.log(classes[0])

                    var classInfo = classes[0].split('-');

                    for(var j = 5; j <= classInfo[1]; j++) {
                        console.log(j)
                        if(!$("#form-" + global_formCount + " " + classInfo[0] + '-' + j).length) {
                            console.log('firing on: ' + j)
                            var DOMelement = $("#form-" + global_formCount + " " + classInfo[0] + '-' + (j - 1)).closest("tr");
                            createNewRow(DOMelement);
                        }
                    }

                    $("#form-" + global_formCount + " ." + classnames).val($(this).val());
                }
            }   
        }
    });
}
 

 function createNewRow(DOMelement) {
    var $newRow = $(DOMelement).clone();
    $(DOMelement).removeClass("create-new-row-on-click");
    $(DOMelement).unbind( "click" );

    table = $(DOMelement).closest("table");

    $newRow.find('input').each(function(){
        var oldId = $(this).attr('class');
        console.log(oldId)
        var idInfo = oldId.split('-');

        var newId = idInfo[0] + '-' + (parseInt(idInfo[1]) + 1);
        $(this).attr('class', newId);
        $(this).attr('name', newId);
    });

    //Dynamic rows
    $newRow.click(function() {
        createNewRow(this);
    });

    console.log(DOMelement)
    console.log(table);

    $(table).append($newRow);
 }
