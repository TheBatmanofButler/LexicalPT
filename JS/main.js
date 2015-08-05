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
}

//Login/logout/reg
$("#RegisterNewUser").submit(function(event) {
    event.preventDefault();
    registerNewUser();
});

$("#SubmitLogin").click(function () {
    submitLogin();
});

$("#HiddenSubmitLogin").submit(function() {
    $("#SubmitLogin").trigger("click");
});

$("#LogoutButton").click(function() {   
    alert("Not logged in");
});

//Retrieve/store info (note: store is in files.js, under form.find('hidden-submit').click(), and retrieve is under widget)
$("#CreateNewForm").click(function(){
    
    removeForms(function() {
        createForm();
        $(".tables").fadeIn(function() {
            $('html, body').animate({
                scrollTop: $("#BreakOne").offset().top
            }, 400);
        });
    });
});

//Copy forward
$("#CopyForward").click(function() {
    copyForward();
});