$("#apptDate").val(new Date().toISOString().substring(0, 10));

$("#LoginButton").click(function showInputLogin() {
    document.getElementById("NewUserButton").style.display = "none";
    document.getElementById("LoginButton").style.display = "none";
    document.getElementById("SubmitLogin").style.display = "inline";
    document.getElementById("UsernameField").style.display = "inline";
    document.getElementById("PasswordField").style.display = "inline";
    document.getElementById("Cancel").style.display = "inline";
});


$("#Cancel").click(function hideInputLogin() {
    document.getElementById("NewUserButton").style.display = "inline";
    document.getElementById("LoginButton").style.display = "inline";
    document.getElementById("SubmitLogin").style.display = "none";
    document.getElementById("UsernameField").style.display = "none";
    document.getElementById("PasswordField").style.display = "none";

    document.getElementById("Cancel").style.display = "none";
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

$("#patient_combobox, #date_combobox").change(function() {
    document.getElementById("queryResetButton").style.display = "inline";
;})

$("#queryResetButton").click(function() {
    $("#queryResetButton").style({"display":"none"});
    $("#patient_combobox").val("");
    $("#date_combobox").val("");
});