//startdate event
var startdate = "2014-02-06";
//enddate event

var enddate = "2014-02-23";
//simulate date before event
var current = "2014-02-05";
//live
//var current = moment();


var options = { proto: "https",
                 host: "eventcms.zdf.de",
                 path: "/xml/olympia2014/epg/" };



//imports
var https = require("https");
var XmlStream = require("xml-stream");
//var moment = require("moment");
var async = require("async");


//main
var urls = require("./urlgen")({ startdate: startdate,
                                 enddate: enddate,
                                 current: current,
                                 options: options });


async.forEachOf(urls.urls, function(item){
    var fetchdata = require("./getUrlContent")(options);
        fetchdata.get(item,function(result){
            console.log(result);        
        });            
});





