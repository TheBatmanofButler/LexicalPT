
//Login bar
$("#LoginButton").click(function showInputLogin() {
    $("#NewUserButton").css("display", "none");
    $("#LoginButton").css("display", "none");
    $("#SubmitLogin").css("display", "inline");
    $("#UsernameField").css("display", "inline");
    $("#PasswordField").css("display", "inline");
    $("#Cancel").css("display", "inline");

    $("#UsernameField").focus();
});


$("#Cancel").click(function hideInputLogin() {
    $("#NewUserButton").css("display", "inline");
    $("#LoginButton").css("display", "inline");
    $("#SubmitLogin").css("display", "none");
    $("#UsernameField").css("display", "none");
    $("#PasswordField").css("display", "none");
    $("#Cancel").css("display", "none");

});

$('#NewUserButton, #CancelUserCreator').click(function toggleUserCreator() {
    $('#FlavorText, #UserCreator, #landingpagebutton').slideToggle('fast');
});

$('#GetStartedButton').click(function() {
    this.parentNodes.submit();    
});

$('#logo').click(function() {
    location.reload();
});

//Prelogin landing page
$('#landingpagebutton').click(function() {
    $('#FlavorText, #UserCreator, #landingpagebutton').slideToggle('fast');
});
