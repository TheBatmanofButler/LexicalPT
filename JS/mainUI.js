$("#LoginButton").click(function showInputLogin() {
    $("#NewUserButton").css("display", "none");
    $("#LoginButton").css("display", "none");
    $("#SubmitLogin").css("display", "inline");
    $("#UsernameField").css("display", "inline");
    $("#PasswordField").css("display", "inline");
    $("#Cancel").css("display", "inline");
    
    /* old stuff because i'm coding at work inside the gitlab editor
    and don't want to fuck things up too badly
    document.getElementById("NewUserButton").style.display = "none";
    document.getElementById("LoginButton").style.display = "none";
    document.getElementById("SubmitLogin").style.display = "inline";
    document.getElementById("UsernameField").style.display = "inline";
    document.getElementById("PasswordField").style.display = "inline";
    document.getElementById("Cancel").style.display = "inline"; */

    $("#UsernameField").focus();
});


$("#Cancel").click(function hideInputLogin() {
    $("#NewUserButton").css("display", "inline");
    $("#LoginButton").css("display", "inline");
    $("#SubmitLogin").css("display", "none");
    $("#UsernameField").css("display", "none");
    $("#PasswordField").css("display", "none");
    $("#Cancel").css("display", "none");
    
    /*
    document.getElementById("NewUserButton").style.display = "inline";
    document.getElementById("LoginButton").style.display = "inline";
    document.getElementById("SubmitLogin").style.display = "none";
    document.getElementById("UsernameField").style.display = "none";
    document.getElementById("PasswordField").style.display = "none";

    document.getElementById("Cancel").style.display = "none"; */
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

$('#landingpagebutton').click(function() {
    $('#FlavorText, #UserCreator, #landingpagebutton').slideToggle('fast');
});

//-----------------------------
$("#AddCloud").click(function(){
    $(".new-cloud-panel").fadeIn();
});

$(".new-cloud-cover").click(function(){
    $(".new-cloud-panel").fadeOut();
});