/**
@author: Amol Kapoor
@date: 8-16-15
@version: 0.1

File manipulation functions for settings bar specifically
*/


/**
    All functions related to form deletion
*/

function deleteToggle() {

    $('.data-form').click( function() {
        var toggleState = deletedForms['#' + $(this).attr('id')]
        if (!toggleState) {
            $(this).closest("li").css('background', 'red');
            deletedForms['#' + $(this).parent('li').attr('id')] = true;
        } else if (toggleState) {
            $(this).closest("li").css('background', 'yellow');
            deletedForms['#' + $(this).parent('li').attr('id')] = false;
        }
    });
}

function finalDelete(all) {

    if (all) {
        $('.data-form').each(function() {
            if ($(this).parent('li').attr('id') != 'form-default') {
                deletedForms['#' + $(this).parent('li').attr('id')] = true;
            }
        });
    }
    
    var formIDs = Object.keys(deletedForms);

    for (var eachForm in formIDs) {
        //this is doing it the dumb way; extra calls to the server that don't need to be made
        if (deletedForms[formIDs[eachForm]] === true) {
            deleteForm(formIDs[eachForm]);
        }
    }

    $(".forms").animate({ scrollLeft: 0}, 400);
}

/**
    Creates a new form for a specific patient
*/
function createNewPatientForm() {
    createForm(true);
    attachSubmitHandler('#form-' + global_formCount);

    $(".forms").animate({ scrollLeft: document.getElementById("Forms").scrollWidth}, 400);
}

/**
    Copies all of the data from the last day to the current day
*/
function copyForward() {
    if(global_formCount < 1)
        return;

    $('#form-' + (global_formCount - 1) + ' :input').each(function(){

        if($(this).val()) {
            var classes = $(this).attr("class")     
            classes = classes.split(" ");

            if(classes[0] !== 'apptDate') {
                openFormData("#form-" + global_formCount, classes[0], $(this).val());  
            }
        }
    });
}

/**
    Downloads all visible forms as pdfs
*/
function downloadFormsAsPDF() {
    var doc = new jsPDF();

    var yStart = 20;
    var xStart = 15;
    var titleFontSize = 30;

    doc.setFontSize(titleFontSize);

    doc.text(xStart, yStart, "Patient Info for: " + global_patientInfo.currentPatient);

    var injuryFontSize = 20;
    doc.setFontSize(injuryFontSize);

    yStart += 15;

    var injuryText = "Patient Injury: " + $('.meta-data .diagnosis').val();
    doc.text(xStart, yStart, injuryText);

    var metaDataFontSize = 15;
    doc.setFontSize(metaDataFontSize);

    var doctorText = "Referring Doctor: " + $('.meta-data .doctorname').val(); 
    var splitDoctorText = doc.splitTextToSize(doctorText, 80);

    var approvalText = "Protocol Approved By: " + $('.meta-data .protocol_approved').val();
    var splitApprovalText = doc.splitTextToSize(approvalText, 80);

    yStart += 10; 

    doc.text(xStart, yStart, splitDoctorText);
    doc.text(xStart + 100, yStart, splitApprovalText);

    yStart += 10; 

    doc.text(xStart, yStart, "Precautions: " + $('.meta-data .precautions').val())

    yStart += 10;

    var yDelta = 5;
    var xDelta = 45;

    var xValueOffset = 10;

    var yOffset = yStart;
    var xOffset = xStart;
    var labelfontSize = 10;

    doc.setFontSize(labelfontSize);

    $('.multi-day-form-exercises-info-container .data-form').each(function() {
     
        var text = $(this).find('label, input, tr');

        var valueText = "";

        for(var i = 0; i < text.length; i++) {

            if($(text[i]).is("input")) {

                if ($(text[i]).val()) {
                    if(valueText)
                        valueText = valueText + ", " + $(text[i]).val();
                    else
                        valueText = $(text[i]).val();
                }

            }
            else if ($(text[i]).is("tr")) {
                
                if(valueText) {
                    doc.text(xOffset + xValueOffset, yOffset, valueText);
                    yOffset += yDelta;
                    valueText = "";
                }

            }
            else {

                if(valueText) {
                    doc.text(xOffset + xValueOffset, yOffset, valueText);
                    yOffset += yDelta;
                    valueText = "";
                }

                doc.text(xOffset, yOffset, $(text[i]).html())
                yOffset += yDelta;
            }
        }

        if(valueText) {
            doc.text(xOffset + xValueOffset, yOffset, valueText);
            yOffset += yDelta;
            valueText = "";
        }

        yOffset = yStart;
        xOffset = xOffset + xDelta;

    });

    //$.when.apply($, deferredArray).then(function() {
        doc.output('dataurlnewwindow');

    //});
}