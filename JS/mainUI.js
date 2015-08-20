/**
    @author: Amol Kapoor
    @date: ???
    @version: 0.1

    Location for all animations/UI based javascript. 
*/

/**
    Prelogin stuff
*/
$("#LoginButton").click(function showInputLogin() {
    $("#LoginButton").css("display", "none");
    $("#SubmitLogin").css("display", "inline");
    $("#UsernameField").css("display", "inline");
    $("#PasswordField").css("display", "inline");
    $("#Cancel").css("display", "inline");

    $("#UsernameField").focus();
});


$("#Cancel").click(function hideInputLogin() {
    $("#LoginButton").css("display", "inline");
    $("#SubmitLogin").css("display", "none");
    $("#UsernameField").css("display", "none");
    $("#PasswordField").css("display", "none");
    $("#Cancel").css("display", "none");

});

/**
    UI function that displays the current username on top banner

    @param: username; string; the name of the user
*/
function displayCurrentUser(username) {
    if(username)
        $("#CurrentLogin").html("Logged in as: " + username);
    else
        $("#CurrentLogin").html("Not logged in");
}

//called immediately after login
function postLogin() {
    displayCurrentUser(global_username);
    $(".prelogin-content, #landingpagebutton, .login-hide").fadeOut( function() {   
        $(".postlogin-content").fadeIn();

        $(".login-show").fadeIn().css("display","inline");
    });
}

/**
    Post login stuff
*/

$('.forms').scroll(function() {
    $(this).find('.meta-data').css('left', $(this).scrollLeft());
});

//Fade for successful data submission
function postSubmit() {
    $('#successAlert').fadeTo( 400, .75 )
    $('#successAlert').delay(2000).fadeTo( 400, 0 );
}


//Called after loading forms from db
function postFormLoad(requestedDate) {
    $(".tables").fadeIn(function() {

        var length = Patient2Date[global_patientInfo.currentPatient].length;
        var index = length - Patient2Date[global_patientInfo.currentPatient].indexOf(requestedDate.toString()) - 1;
        var scroll = document.getElementById('Forms').scrollWidth/length * index;

        $(".forms").animate({ scrollLeft: 0}, 0);
        $(".forms").animate({ scrollLeft: scroll}, 400);
    });
    
    $('html, body').animate({
            scrollTop: $("#BreakOne").offset().top
    }, 400);
}

//Called after closing a patient injury
function postCloseInjury() {
    removeForms();
    $('html, body').animate({
        scrollTop: 0
    }, 400);
    $("#queryResetButton").click();
}

//Called after creating a new patient entry (not a new form within a patient)
function postCreateNewForm() {
    $(".tables").fadeIn(function () {
        $(".forms").animate({ scrollLeft: scroll}, 400);
    });

    $('html, body').animate({
        scrollTop: $("#BreakOne").offset().top
    }, 400);
}

//Called after patient deletion
function postDeleteAll() {
    $(".forms").animate({ scrollLeft: 0}, 400);

    removeForms();
    $('html, body').animate({
        scrollTop: 0
    }, 400);
    
    $("#queryResetButton").click();
}

//Called after user logs out
function postLogout() {
    $(".postlogin-content, .login-show, #successAlert").fadeOut( function() {   
        $(".prelogin-content, #landingpagebutton, .logout-show").fadeIn();
        $("#queryResetButton").click();
    });
}
