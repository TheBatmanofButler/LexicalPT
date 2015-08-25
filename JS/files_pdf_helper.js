/**
@author: Amol Kapoor
@date: 8-16-15
@version: 0.1

File manipulation functions for pdfs
*/

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


function calculateSizes(doc, startingForm, formsPerPage) {
    var rowObj = {};
    var sizeObj = {};

    var forms = $('.multi-day-form-exercises-info-container .exercise-info').get();

    $(forms[0]).find('label').each(function () {
        rowObj[$(this).html().replace(/\s+/g, '')] = 0;
        sizeObj[$(this).html().replace(/\s+/g, '')] = [];
    });

    forms = forms.slice(startingForm, startingForm + formsPerPage);

    //count the number of rows
    $(forms).each(function () {
        var currentLabel = "";
        var currentCount = 0;

        $(this).find('label, input').each(function () {

            if($(this).is('label')) {
                if(currentLabel)    
                    rowObj[currentLabel] = Math.max(currentCount/3, rowObj[currentLabel]);
                
                currentLabel = $(this).html().replace(/\s+/g, '');
                currentCount = 0;
            }
            else if ($(this).is('input') && $(this).val()) {
                currentCount++;
            }

        });

        if(currentLabel)    
            rowObj[currentLabel] = Math.max(currentCount/3, rowObj[currentLabel]);
                
    });

    //count the size per row
    $(forms).find('label').each(function() {

        var currentLabel = $(this).html().replace(/\s+/g, '');

        var rowCount = -1;

        //traverse all of the rows per form
        $(this).siblings('table').find('tr').each(function () {

            var rowSize = 0;

            var index = 0; 

            $(this).find('input').each(function () {

                var length = 0;

                //min
                if(index%3 === 2) {
                    var textArray = doc.splitTextToSize($(this).val(), 25);
                    length = textArray.length;
                }
                else if(index%3 === 1) {
                    var textArray = doc.splitTextToSize($(this).val(), 30);
                    length = textArray.length;
                }
                else {
                    var textArray = doc.splitTextToSize($(this).val(), 80);
                    length = textArray.length;
                }

                rowSize = Math.max(rowSize, length);

                index++;
            });

            if(!sizeObj[currentLabel][rowCount]) {
                sizeObj[currentLabel][rowCount] = 0;
            }

            sizeObj[currentLabel][rowCount] = Math.max(rowSize, sizeObj[currentLabel][rowCount]);

            rowCount++;
        });
    });

    console.log(sizeObj)

    return sizeObj;
}

function createTable(doc, pdfInfo, order, xStart, yStart, formsPerPage) {

    var yDelta = 20;
    var pageWidth = 524;
    var yOffset = yStart;
    var xOffset = xStart;

    var xColumnStart = xOffset + 90;

    var xDelta = (pageWidth - xColumnStart + 46)/formsPerPage;

    var randomOffset = 13;

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

        for(var j = 0; j < pdfInfo[order[i]].length; j++) {
            doc.rect(xColumnStart - randomOffset/2, yOffset - randomOffset, xOffset + pageWidth - xDelta + 70, 13*pdfInfo[order[i]][j], 'S');
            yOffset += 13*pdfInfo[order[i]][j];
        }

        if(pdfInfo[order[i]].length === 0) 
                yOffset += yDelta;

        doc.rect(xOffset, yColumnTop - randomOffset, xOffset + pageWidth, yOffset - yColumnTop, 'S');
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


function fillTable(doc, form, formCount, formsPerPage, pdfInfo, xStart, yStart) {
    
    var yDelta = 20;
    var pageWidth = 524;
    var yOffset = yStart;
    var xOffset = xStart;

    var xColumnStart = xOffset + 90;

    var xDelta = (pageWidth - xColumnStart + 46)/formsPerPage;

    var randomOffset = 13;
    var SRWOffset = 82;
    var MinOffset = SRWOffset + 33;

    doc.text(xColumnStart + xDelta*formCount, yOffset, $(form).find('.apptDate').val());

    yOffset += yDelta*2;

    var i = 0;

    var currentLabel = "";

    $(form).find('.exercise-info input, .exercise-info label').each(function () {

        if($(this).is('label')) {
            currentLabel = $(this).html().replace(/\s+/g, '');
        }
        else if ($(this).is('input')) {

            if(i%3 === 2) {
                var textArray = doc.splitTextToSize($(this).val(), 25);
                console.log(textArray)

                doc.text(xColumnStart + xDelta*formCount + MinOffset, yOffset, textArray);

                yOffset += 13*pdfInfo[currentLabel][Math.floor(i/3)]; 
            }
            else if(i%3 === 1) {
                var textArray = doc.splitTextToSize($(this).val(), 30);
                console.log(textArray)
                doc.text(xColumnStart + xDelta*formCount + SRWOffset, yOffset, textArray);
            }
            else {
                var textArray = doc.splitTextToSize($(this).val(), 80);
                console.log(textArray)
                doc.text(xColumnStart + xDelta*formCount, yOffset, textArray);
            }

            i++;
        }
    });

    doc.text(xColumnStart + xDelta*formCount, yOffset, $(form).find('.supervising-pt').val());
    yOffset += yDelta;

    doc.text(xColumnStart + xDelta*formCount, yOffset, $(form).find('.time-in').val());
    yOffset += yDelta;

    doc.text(xColumnStart + xDelta*formCount, yOffset, $(form).find('.time-out').val());
    yOffset += yDelta;

    doc.text(xColumnStart + xDelta*formCount, yOffset, $(form).find('.progress').val());
    yOffset += yDelta;
    
}