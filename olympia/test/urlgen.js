//test url generator
var should = require('should');
var moment = require("moment");
var https = require('https');
var async = require('async');


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
var urls = [];


for(var i = 0; i<=duration; i++){

    //console.log(current.format("YYYY-MM-DD") );
    var log = "";
    
    switch (true) {
        case (current.isBefore(startdate)):
            log = "before";            
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
    
    urls.push({ startdate: startdate.clone(),
                enddate: enddate.clone(),
                current: current.clone(),
                log: log });

    current.add(1,"days");    
}
var result = {};
var count = 0;

describe('Asynchronous Date => url testing', function(){
    async.forEachOf(urls, function(element, index, array){

        var url = require("../app/urlgen")({ startdate: element.startdate,
                                        enddate: element.enddate,
                                        current: element.current,
                                        path: "test"});
                               

        it("Result expected: \""+element.log+"\" <=> received: \""+url.log+"\"",function(){ 
            should(url.log).startWith( element.log);
        });

    });
});



it('should return -1 when not present', function() { 
      should.equal(-1, [1,2,3].indexOf(4));
    });



