/**
@author: Amol Kapoor
@date: 8-16-15
@version: 0.1

File manipulation functions for pdfs
*/

function calculateSizes() {
    var dataObj = {};

    $('.multi-day-form-exercises-info-container .exercise-info').each(function() {
     
        var text = $(this).find('label, input');
        
        var currentLabel = "";
        var currentCount = 0;

        for(var i = 0; i < text.length; i++) {

            if($(text[i]).is("input")) {
                if($(text[i]).val()) {
                    currentCount++;
                }
            }
            else {
                 
                if(currentLabel && (!dataObj[currentLabel] || currentCount > dataObj[currentLabel])) {
                   dataObj[currentLabel] = currentCount;
                }

                currentLabel = $(text[i]).html().replace(/ /g,'');
                currentCount = 0;
            }
        }

        if(!dataObj[currentLabel] || currentCount > dataObj[currentLabel]) {
             dataObj[currentLabel] = currentCount;
        }
    });

    return dataObj;
}


function addMetaDataToPDF(doc, xStart, yStart) {

    //load meta data
    var titleFontSize = 30;

    var yDelta = 20;
    var xDelta = 45;

    doc.setFontSize(titleFontSize);

    doc.text(xStart, yStart, "Patient Info for: " + global_patientInfo.currentPatient);

    var injuryFontSize = 20;
    doc.setFontSize(injuryFontSize);

    yStart += yDelta*2;

    var injuryText = "Patient Injury: " + $('.meta-data .diagnosis').val();
    doc.text(xStart, yStart, injuryText);

    var metaDataFontSize = 15;
    doc.setFontSize(metaDataFontSize);

    yStart += yDelta*2; 

    var doctorText = "Referring Doctor: " + $('.meta-data .doctorname').val(); 
    var splitDoctorText = doc.splitTextToSize(doctorText, 250);

    var approvalText = "Protocol Approved By: " + $('.meta-data .protocol_approved').val();
    var splitApprovalText = doc.splitTextToSize(approvalText, 250);

    doc.text(xStart, yStart, splitDoctorText);
    doc.text(xStart + 250, yStart, splitApprovalText);

    yStart += yDelta; 

    var premodality = "Pre-Modality: " + $('.meta-data .premodality').val(); 
    var splitModality = doc.splitTextToSize(premodality, 250);

    var postmodality = "Post-Modality: " + $('.meta-data .postmodality').val();
    var splitpostModality = doc.splitTextToSize(postmodality, 250);

    doc.text(xStart, yStart, splitModality);
    doc.text(xStart + 250, yStart, splitpostModality);

    yStart += yDelta; 

    doc.text(xStart, yStart, "Precautions: " + $('.meta-data .precautions').val())
    
    yStart += yDelta*2;

    return {doc: doc, xStart: xStart, yStart: yStart};
}


function createTable(doc, pdfInfo, order, xStart, yStart, formsPerPage) {

    var yDelta = 20;
    var pageWidth = 524;
    var yOffset = yStart;
    var xOffset = xStart;

    var xColumnStart = xOffset + 90;

    var xDelta = (pageWidth - xColumnStart + 46)/formsPerPage;

    var randomOffset = 13;

    var rowLabelSize = 10;
    doc.setFontSize(rowLabelSize);

    doc.rect(xOffset, yOffset - randomOffset, xOffset + pageWidth, yDelta, 'S')

    doc.text(xOffset, yOffset, "  Date");
    
    yOffset += yDelta;

    doc.rect(xOffset, yOffset - randomOffset, xOffset + pageWidth, yDelta, 'S')

    doc.text(xOffset, yOffset, "  Columns");

    for(var i = 0; i < formsPerPage; i++) {
        doc.text(xColumnStart + xDelta*i, yOffset, "Exercises              S/R/W  Min");
    }

    doc.rect(xOffset, yOffset - randomOffset, xOffset + pageWidth, yDelta, 'S')

    yOffset += yDelta;

    var yColumnTop = yOffset;

    for(var i = 0; i < order.length; i++) {
        
        doc.text(xStart, yOffset, "  " + order[i]);

        doc.rect(xOffset, yOffset - randomOffset, xOffset + pageWidth, yDelta*(Math.ceil(pdfInfo[order[i]]/3)), 'S')
        

        for(var j = 0; j < Math.ceil(pdfInfo[order[i]]/3) - 1; j++) {
            yOffset += yDelta;
            doc.rect(xColumnStart - randomOffset/2, yOffset - randomOffset, xOffset + pageWidth - xDelta + 70, yDelta, 'S')
        }

        yOffset += yDelta;
    }

    doc.text(xOffset, yOffset, "  SupervisingPT");

    doc.rect(xOffset, yOffset - randomOffset, xOffset + pageWidth, yDelta, 'S')

    yOffset += yDelta;

    doc.text(xOffset, yOffset,   "  Time in");
    doc.rect(xOffset, yOffset - randomOffset, xOffset + pageWidth, yDelta, 'S')

    yOffset += yDelta;

    doc.text(xOffset, yOffset,   "  Time out");
    doc.rect(xOffset, yOffset - randomOffset, xOffset + pageWidth, yDelta, 'S')

    yOffset += yDelta;

    doc.text(xOffset, yOffset,   "  Progress");
    doc.rect(xOffset, yOffset - randomOffset, xOffset + pageWidth, yDelta, 'S')

    yOffset += yDelta;

    for(var i = 0; i < formsPerPage; i++) {
        doc.rect(xColumnStart + xDelta*i - randomOffset/2, yStart - randomOffset, xDelta, yOffset-yStart, 'S')
    }

    return {doc: doc, xStart: xStart, yStart: yStart};
}


function fillTable(doc, form, formCount, formsPerPage, xStart, yStart) {
    
    var yDelta = 20;
    var pageWidth = 524;
    var yOffset = yStart;
    var xOffset = xStart;

    var xColumnStart = xOffset + 90;

    var xDelta = (pageWidth - xColumnStart + 46)/formsPerPage;

    var randomOffset = 13;
    var SRWOffset = 85;
    var MinOffset = SRWOffset + 30;

    doc.text(xColumnStart + xDelta*formCount, yOffset, $(form).find('.apptDate').val());

    var inputs = $(form).find('.exercise-info input').get();

    yOffset += yDelta*2;

    for(var i = 0; i < inputs.length; i+=3) {
        var valueText = $(inputs[i]).val() + " " + $(inputs[i + 1]).val() + " " + $(inputs[i + 2]).val();
        doc.text(xColumnStart + xDelta*formCount, yOffset, $(inputs[i]).val());
        doc.text(xColumnStart + xDelta*formCount + SRWOffset, yOffset, $(inputs[i + 1]).val());
        doc.text(xColumnStart + xDelta*formCount + MinOffset, yOffset, $(inputs[i + 2]).val());
        yOffset += yDelta;
    }

    doc.text(xColumnStart + xDelta*formCount, yOffset, $(form).find('.supervising-pt').val());
    yOffset += yDelta;

    doc.text(xColumnStart + xDelta*formCount, yOffset, $(form).find('.time-in').val());
    yOffset += yDelta;

    doc.text(xColumnStart + xDelta*formCount, yOffset, $(form).find('.time-out').val());
    yOffset += yDelta;

    doc.text(xColumnStart + xDelta*formCount, yOffset, $(form).find('.progress').val());
    yOffset += yDelta;
    
}