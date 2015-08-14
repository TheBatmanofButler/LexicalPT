
//Login bar
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

$('#logo').click(function() {
    location.reload();
});

//Fade for successful data submission
function postSubmit() {
    $("html, body").animate({ scrollTop: 0 }, 1000);
    $('#successAlert').fadeTo( 400, .75 )
    $('#successAlert').delay(3000).fadeTo( 400, 0 );
}
