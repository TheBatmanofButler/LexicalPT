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

//Retrieve/store info (note: store is in files.js, under form.find('hidden-submit').click(), and retrieve is under widget)
/*$("#RetrieveInfoTest").click(function() {
    loadFormFromDB();
});*/

$("#CreateNewForm").click(function(){
    removeForms(function() {
        createForm();
        attachSubmitHandler('#form-' + global_formCount);
        $('html, body').animate({
            scrollTop: $("#BreakOne").offset().top
        }, 400);
    });
});

//Copy forward
$("#CopyForward").click(function() {
    copyForward();
});

//Load removeForms
$("#SubmitForms").click(function(){
    loadChangedFormsToDB();
});