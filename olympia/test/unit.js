//test ugen

//startdate
var startdate = "2014-02-06";
//enddate
var enddate = "2014-02-23";
//simulate old date
var current_start = "2014-02-05";
var current_stop  = "2014-02-24";


test("Date before startdate should return \"zu früh\"", function(){
    var urls = require("../urlgen")({ startdate: startdate,
                                     enddate: enddate,
                                     current: current_start,
                                     path: "test"});
	


});


//main
// var urls = require('./urlgen')({ startdate: startdate,
//                                  enddate: enddate,
//                                  current: current,
//                                  path: options.path});


suite("Date between startdate and enddate should return \"mittendrin\"", function () {

	test("Date before startdate should return \"zu früh\"", function(){

	});

});