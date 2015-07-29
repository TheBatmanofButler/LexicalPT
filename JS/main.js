/**
@author: Amol Kapoor
@date: 6-30-15
@version: 0.1

Runner file. Executes program, initializes available libraries, etc. 
*/

//Event triggers

var FakePatients = [
	"Trudie Hills",
	"Branden Pannell",
	"Beryl Gondek",
	"Latricia Balas",
	"Tawanna Fairman",
	"Lanie Mckinny",
	"Arica Hockman",
	"Marivel Lamer",
	"Maddie Westray",
	"Maryrose Heier",
	"Kandy Travis",
	"Ladonna Yohn",
	"Karima Mcadams",
	"Ja Hedden",
	"Elaine Baver",
	"Caridad Najera",
	"Hien Serpa",
	"Drusilla Beech",
	"Kathlene Hemsley",
	"Dalila Merola"
	]

$.widget( "custom.combobox", {
      _create: function() {
        this.wrapper = $( "<span>" )
          .addClass( "custom-combobox" )
          .insertAfter( this.element );
 
        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
      },
 
      _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
          value = selected.val() ? selected.text() : "";
 
        this.input = $( "<input>" )
          .appendTo( this.wrapper )
          .val( value )
          .attr( "title", "" )
          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" )
          })
          .tooltip({
            tooltipClass: "ui-state-highlight"
          });
 
        this._on( this.input, {
          autocompleteselect: function( event, ui ) {
            ui.item.option.selected = true;
            this._trigger( "select", event, {
              item: ui.item.option
            });
          },
 
          autocompletechange: "_removeIfInvalid"
        });
      },
 
      _createShowAllButton: function() {
        var input = this.input,
          wasOpen = false;
 
        $( "<a>" )
          .attr( "tabIndex", -1 )
          .attr( "title", "Show All Items" )
          .tooltip()
          .appendTo( this.wrapper )
          .button({
            icons: {
              primary: "ui-icon-triangle-1-s"
            },
            text: false
          })
          .removeClass( "ui-corner-all" )
          .addClass( "custom-combobox-toggle ui-corner-right" )
          .mousedown(function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
          })
          .click(function() {
            input.focus();
 
            // Close if already visible
            if ( wasOpen ) {
              return;
            }
 
            // Pass empty string as value to search for, displaying all results
            input.autocomplete( "search", "" );
          });
      },
 
      _source: function( request, response ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        response( this.element.children( "option" ).map(function() {
          var text = $( this ).text();
          if ( this.value && ( !request.term || matcher.test(text) ) )
            return {
              label: text,
              value: text,
              option: this
            };
        }) );
      },
 
      _removeIfInvalid: function( event, ui ) {
 
        // Selected an item, nothing to do
        if ( ui.item ) {
          return;
        }
 
        // Search for a match (case-insensitive)
        var value = this.input.val(),
          valueLowerCase = value.toLowerCase(),
          valid = false;
        this.element.children( "option" ).each(function() {
          if ( $( this ).text().toLowerCase() === valueLowerCase ) {
            this.selected = valid = true;
            return false;
          }
        });
 
        // Found a match, nothing to do
        if ( valid ) {
          return;
        }
 
        // Remove invalid value
        this.input
          .val( "" )
          .attr( "title", value + " didn't match any item" )
          .tooltip( "open" );
        this.element.val( "" );
        this._delay(function() {
          this.input.tooltip( "close" ).attr( "title", "" );
        }, 2500 );
        this.input.autocomplete( "instance" ).term = "";
      },
 
      _destroy: function() {
        this.wrapper.remove();
        this.element.show();
      }
    });

$.each((FakePatients), function(index, PatientName) {   
  $('#combobox')
    .append($("<option></option>")
    .attr("value",PatientName)
    .text(PatientName)); 
});

$( "#combobox" ).combobox();


$("#DataForm").submit(function(event) {
	event.preventDefault();

    var $inputs = $('#DataForm :input');
    var values = {};
    values.name = "store";
    values.userKey = global_userKey;

    $inputs.each(function() {
        values[this.name] = $(this).val();
    });

	socket.emit("clientToServer", values,
		function(data, err, isAppError) {
		if(err) {
			errorHandler(err, isAppError);
		} 
		else {
			alert("Success?")
		}
	});
});

$("#SubmitData").click(function() {
	$("#DataForm").submit();
});

$("#SubmitLogin").click(function () {
	alert('bitch2');
    $("#TitlebarForm").submit(function(event) {
		event.preventDefault();

	    var $inputs = $('#TitlebarForm :input');
		var values = {};
	    $inputs.each(function() {
	        values[this.name] = $(this).val();
	    });
	    console.log(values);
		socket.emit("clientToServer", {
	        name: "login",
	        username: values.username,
			password: values.password
		}, function(data, err, isAppError) {
			if(err) {
				errorHandler(err, isAppError);
			} 
			else {
				login(data);
			}
		});
	});

	$("#TitlebarForm").submit();
});

$("#LogoutButton").click(function() {   
	alert("Not logged in");
});

$("#RegisterNewUser").submit(function(event) {
	event.preventDefault();

    var $inputs = $('#RegisterNewUser :input');
    console.log($inputs);
	var values = {};
    $inputs.each(function() {
        values[this.name] = $(this).val();
    });
    console.log(values)
	socket.emit("clientToServer", {
		name: "newUser",
		username: values.username,
		password: values.password,
		email: values.email, 
		fullname: values.firstname + " " + values.lastname
	}, function(data, err, appError) {
		if(err) {
			errorHandler(err, appError);
		}		
		else {
			login(data);
		}
	});
});

$("#HiddenSubmitLogin").submit(function() {
	alert('bitch');
	$("#SubmitLogin").trigger("click");
})


$("#RetrieveInfoTest").click(function() {
    patient = prompt("PatientName?");
    date = prompt("date?");

    socket.emit("clientToServer", {
        name: 'retrieve',
        userKey: global_userKey,
        patient: patient,
        date: date
    }, function(data, err, appError) {
        console.log(data);
        alert(data);
    });
});