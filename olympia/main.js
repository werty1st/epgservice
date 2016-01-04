//startdate
var startdate = "2014-02-06";
//enddate
var enddate = "2014-02-23";
//simulate old date
var current = "2014-02-05";
//live
//var current = moment();


var options = { host: 'eventcms.zdf.de',
                path: '/xml/olympia2014/epg/' };



//imports
var https = require('https');
var XmlStream = require('xml-stream');
var moment = require('moment');


//main
var urls = require('./urlgen')({ startdate: startdate,
                                 enddate: enddate,
                                 current: current,
                                 path: options.path});

console.log(urls);


function getXML(url,callback){

    console.log(url);
    var request = https.get({host:options.host,path:url}).on('response', function(response) {

        var xml = new XmlStream(response, 'utf8');

        xml.on('data', function(data) {
            process.stdout.write(data);
        });

    });

}
