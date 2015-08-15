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

//Retrieve/store info (note: store is in files.js, under form.find('hidden-submit').click(), and retrieve is under widget)
/*$("#RetrieveInfoTest").click(function() {
    loadFormFromDB();
});*/

$("#CreateNewForm").click(function(){
    createNewForm();
});

//SETTINGS BAR FOR FORMS

//Copy forward
$("#CopyForward").click(function() {
    copyForward();
});

//Load removeForms
$("#SubmitForms").click(function(){
    loadChangedFormsToDB();
});

//Load next/prev five docs
$("#NextFive").click(function() {
    loadNextFive();
});

$("#PrevFive").click(function() {
    loadPrevFive();
});

function main() {
    if (localStorage.getItem("username")) {
        $("#UsernameField").val(localStorage.getItem("username"));
    }

    if (localStorage.getItem("password")) {
        $("#PasswordField").val(localStorage.getItem("password"));
    }  
}

main();