//test url generator
var should = require('should');
var moment = require("moment");

//startdate
var startdate = moment("2014-02-06");
//enddate
var enddate = moment("2014-02-23");
//simulate old date
var current_start = moment("2014-02-05");
var current_stop  = moment("2014-02-24");
var current = current_start;

var duration = moment.duration( current_stop.diff(current_start) ).asDays();

//array bauen
//https://zackehh.com/asynchronous-test-loops-with-mocha/

for(var i = 0; i<=duration; i++){

    //console.log(current.format("YYYY-MM-DD") );
    var log = "";
    
    switch (true) {
        case (current.isBefore(startdate)):
            log = "xx";            
            break;
        case (current.isSame(startdate)):
            log = "in progress";            
            break;
        case (current.isBetween(startdate,enddate)):
            log = "in progress";            
            break;
        case (current.isSame(enddate)):            
            log = "last day";
            break;
        case (current.isAfter(enddate)):            
            log = "done";
            break;
        default:
            break;
    }    
    
    test("should return "+ log, function() {
        var urls = require("../app/urlgen")({ startdate: startdate,
                                        enddate: enddate,
                                        current: current,
                                        path: "test"}
                                        );
        console.log("log",log);
        should(urls.log).startWith( log );
    });
    current.add(1,"days");
}