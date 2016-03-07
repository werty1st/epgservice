/* global process global */

var Parallel = require('paralleljs');
var https = require("https");
var db = require("./couchdb/db");
var async = require("async");
var readXMLstream = require("./xml/readXMLstream");
var SenderGruppe = require("./sender/SenderGruppe");

var moment = require("moment");
var bunyan = require('bunyan'), bformat = require('bunyan-format'), formatOut = bformat({ outputMode: 'short' });
var log = bunyan.createLogger({
    name: 'epgservice/olympia/main',
    stream: formatOut
    });

// startdate event
var startdate = "2014-02-06";

// enddate event
var enddate = "2014-02-23";


/**
 * delta berechnen und dann allen datumsanagben draufrechnen
 * heute - 2014-02-12 = x days
 */
var delta = global.delta = moment().diff(moment("2014-02-06"), "days") ;
    log.info("Delta:",delta);
    log.info("Delta:",process.env.DB);


var options = { proto: "https",
                 host: "eventcms.zdf.de",
                 path: "/xml/olympia2014/epg/" };

//main
var ecms_urls = require("./urlgen")({ startdate, enddate, options });



// create new SenderGruppe
var senderGruppe = new SenderGruppe(db);
var websender = senderGruppe.web;
var zdfsender = senderGruppe.zdf;

    senderGruppe.completed(websender, function(){
        console.log("websender finished");
        end();
    });

    senderGruppe.completed(zdfsender, function(){
        console.log("zdfsender finished");
    });


    websender.update({ urls:ecms_urls });
    zdfsender.update();





function end(){
    //bot.close();
    process.exit();
}


/*
function exitHandler(options, err) {
    if (options.cleanup) console.log('clean');
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));*/