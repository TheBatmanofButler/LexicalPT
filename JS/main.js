/**
@author: Amol Kapoor
@`: 6-30-15
@version: 0.1

Runner file. Executes program, initializes available libraries, etc. 
*/

//Event triggers

//The only default function that should be here: default error handler
function errorHandler(data, isAppError) {
    console.log(data);
    alert(data.message);

    if(data.name && data.name === 'loginFailure') {
        submitLogout();
        logout();
    }
}

$("#SubmitLogin").click(function () {
    submitLogin();
});

$("#TitlebarForm").submit(function(event) {
    event.preventDefault();
    $("#SubmitLogin").trigger("click");
});

$("#Logout").click(function() {   
    submitLogout();
});


//minute update trigger
$('.multi-day-form-exercises-info-container').on("change", ".min", function() {
    var parentContainer = $(this).closest('.table-container');

    var minCount = 0;
    
    $(parentContainer).find('.min').each(function () {
        minCount += parseInt($(this).val()) || 0;
    });

    $(this).closest('.table-container').find('.cumulative-min').html(minCount + "");
});


//new form button
$("#CreateNewForm").click(function(){
    createNewForm();
});

/**
    Setting triggers
*/

// Reveal delete form checkboxes
$("#DeleteMode").click(function() {

    $('#DeleteMode').animate({ opacity: 0 });
    $('#CancelDelete').fadeIn().css({'display':'inline-block'});
    $('#DeleteSelected').fadeIn().css({'display':'inline-block'});
    $('#DeleteAll').fadeIn().css({'display':'inline-block'});

    $('.data-form').closest("li").css('background', 'rgba(25, 255, 25, .25)');

    deleteToggle();
});

$('#CancelDelete').click(function() {
    $('#DeleteMode').animate({ opacity: 100 });
    $('#CancelDelete').fadeOut();
    $('#DeleteSelected').fadeOut();
    $('#DeleteAll').fadeOut();

    $(".data-form").unbind( "click" );
    $('.data-form').closest("li").css('background', 'rgba(25, 28, 181, .25)');
    deletedForms = {};
})

$('#DeleteSelected').click(function() {
    finalDelete(false);
    $('#CancelDelete').trigger('click');
})

$('#DeleteAll').click(function() {
    finalDelete(true);
    $('#CancelDelete').trigger('click');
})

//Copy forward
$("#CopyForward").click(function() {
    copyForward();
});

// Load removeForms
$("#SubmitForms").click(function(){
    loadChangedFormsToDB(function() {
        removeForms();
        $('html, body').animate({
            scrollTop: 0
        }, 400);
        $("#queryResetButton").click();
    });
});

//Load next/prev five docs
$("#NextFive").click(function() {
    loadNextFive();
});

$("#PrevFive").click(function() {
    loadPrevFive();
});

//Create new form for the patient
$("#SettingsNewForm").click(function() {
    createNewPatientForm();
});

//Download form as pdf
$("#DownloadForms").click(function() {
    downloadFormsAsPDF();
});

//Closes a patient cycle
$("#CloseInjury").click(function() {
    console.log("hello")
    closePatientInjury();
});

//Password/username
function main() {
    if (localStorage.getItem("username")) {
        $("#UsernameField").val(localStorage.getItem("username"));
    }

    if (localStorage.getItem("password")) {
        $("#PasswordField").val(localStorage.getItem("password"));
    } 

    $('.meta-data .patient_first, .meta-data .patient_last').change(function() {
        updateCurrentPatient();

        if(Patient2Date[global_patientInfo.currentPatient]) {
            alert("This patient is already in the database. Please select another name.");
            $(this).val("");
        }
    });
}

main();