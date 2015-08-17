/**
@author: Amol Kapoor
@date: 7-7-15
@version: 0.1

Global config location for all multi-file-wide files (client side)
*/

//Connection to Backend
var socket = io('http://54.86.173.127:4000');

//Number of forms currently up
var global_formCount = -1;

//Number of forms with changed id values
var changedFormIDs = {};

//Data for the current patient that is loaded
var currentPatient = "";
var lastDateLoaded = "";
var firstDateLoaded = "";

//Used to track changed forms
var global_deferredArray = [];

//Used to track default number of exercise slots
var global_slotCount = 3;
