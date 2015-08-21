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
        var toggleState = deletedForms['#' + $(this).parent('li').attr('id')]

        if (!toggleState) {
            $(this).closest("li").css('background', 'red');
            deletedForms['#' + $(this).parent('li').attr('id')] = true;
        } else {
            $(this).closest("li").css('background', 'yellow');
            deletedForms['#' + $(this).parent('li').attr('id')] = false;
        }
    });
}

function finalDelete(all) {

    if (all) {
        if(!confirm("Are you sure you want to delete this patient's information?")) {
            return;
        }

        $('.multi-day-form-exercises-info-container .data-form').each(function() {
            deletedForms['#' + $(this).parent('li').attr('id')] = true;
        });
        
        postDeleteAll();
    }
    
    var formIDs = Object.keys(deletedForms);


    for (var eachForm in formIDs) {
        //this is doing it the dumb way; extra calls to the server that don't need to be made
        if (deletedForms[formIDs[eachForm]] === true) {

            if($(formIDs[eachForm]).find('.apptDate').val() && global_patientInfo.currentPatient)
                deleteForm(formIDs[eachForm]);
            else {
                var formID = $(formIDs[eachForm]).attr('id');
                delete changedFormIDs['#' + formID];
                $(formIDs[eachForm]).remove();
            }
        }
    }
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
/**
    Downloads all visible forms as pdfs
*/
function downloadFormsAsPDF() {
    var doc = new jsPDF('p', 'pt');

    var formList = $('.multi-day-form-exercises-info-container .data-form').get();

    var formsPerPage = 3;

    for(var formGroup = 0; formGroup < formList.length; formGroup+=formsPerPage) {
        
        if(formGroup > 0) {
            doc.addPage();
        }

        var yStart = 50;
        var xStart = 20;

        var pdfInfo = calculateSizes();
        console.log(pdfInfo)
        var metaDataInfo = addMetaDataToPDF(doc, xStart, yStart);

        doc = metaDataInfo.doc;
        yStart = metaDataInfo.yStart;
        xStart = metaDataInfo.xStart;

        var order = ['TableExercises', 'Stretches', 'Thera-Band', 'Machines', 'FloorExercises'];

        var createTableInfo = createTable(doc, pdfInfo, order, xStart, yStart, formsPerPage);
        
        for(var form = 0; form < formsPerPage && form + formGroup < formList.length; form++) {
               
            fillTable(doc, $(formList[formGroup + form]), form, formsPerPage, xStart, yStart);
            
        }

        doc.text(xStart, 820, "Powered by Diagraphic Technologies");
    }

    //$.when.apply($, deferredArray).then(function() {
        doc.output('dataurlnewwindow');

        doc.output('save', "patient_data.pdf");

    //});
}