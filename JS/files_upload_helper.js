/**
@author: Amol Kapoor
@date: 8-16-15
@version: 0.1

File manipulation helper functions for uploading data. API. 
*/


/**
    Processes form info for upload. 

    @param: form; string; #formid
*/
function processForm(form) {

    var values = {};

    //load meta-data first
    $('.meta-data :input').each(function() {
        if(this.name) {
            if(this.name === 'patient_last') {
                lastName = $(this).val().toUpperCase();
            }
            else if (this.name === 'patient_first') {
                firstName = $(this).val().toUpperCase();
            }
            else {
                values[this.name] = $(this).val();
            }
        }
    });

    //query the form, convert to object
    var $inputs = $(form +' :input');
    $inputs.each(function() {
        if(this.name) {
            values[this.name] = $(this).val();
        }
    });

    values['apptDate'] = new Date(Date.parse(values['apptDate'])).getTime();
    values['patient'] = lastName + ', ' + firstName;

    return values;
}

