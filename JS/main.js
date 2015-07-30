/**
@author: Amol Kapoor
@date: 6-30-15
@version: 0.1

Runner file. Executes program, initializes available libraries, etc. 
*/

//Event triggers

//The only default function that should be here: default error handler
function errorHandler(data, isAppError) {
    console.log(data);
    alert(data.message);
}

$("#DataForm").submit(function(event) {
    event.preventDefault();
    loadFormToDB();
});

$("#SubmitData").click(function() {
    $("#DataForm").submit();
});

$("#SubmitLogin").click(function () {
    submitLogin();
});

$("#LogoutButton").click(function() {   
    alert("Not logged in");
});

$("#RegisterNewUser").submit(function(event) {
    event.preventDefault();
    registerNewUser();
});

$("#HiddenSubmitLogin").submit(function() {
	$("#SubmitLogin").trigger("click");
})

$("#RetrieveInfoTest").click(function() {
    loadFormFromDB();
});

$("#NewDataTest").click(function(){
    $(".tables").fadeIn();

    $('html, body').animate({
        scrollTop: $("#BreakOne").offset().top
    }, 400);
});