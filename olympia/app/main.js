/* global process bot global */


// startdate event
var startdate = "2014-02-06";

// enddate event
var enddate = "2014-02-23";
//var enddate = "2014-02-22";

// live
//var current = moment();
// simulate date before event
var current = "2014-02-05";
//var current = "2014-02-22";


var options = { proto: "https",
                 host: "eventcms.zdf.de",
                 path: "/xml/olympia2014/epg/" };


// imports
var https = require("https");
//var moment = require("moment");
var async = require("async");
var readXMLstream = require("./xml/readXMLstream");
var bot = require("./bot/bot-client");
var SenderGruppe = require("./sender/SenderGruppe");


global.bot = bot;

bot.log("Init complete"); 

//main
var urls = require("./urlgen")({ startdate: startdate,
                                 enddate: enddate,
                                 current: current,
                                 options: options });
var db = require("./couchdb/db");


// sportarten mapping
//https://ecms.zdf.de/xml/olympia2014/sports.xml

// debug 1 item only
urls.urls = urls.urls.splice(urls.urls.length-1);        

// https://adambom.github.io/parallel.js/
// fetch xml from url
async.forEachOf(urls.urls, function(item, key, asyncDone){
    var fetchXML = require("./xml/fetchXML")(options);
    fetchXML.get(item.url, function(stream){
        //console.log("stream url", item.url);
        var senderGruppe = new SenderGruppe(db);
        readXMLstream(stream, senderGruppe, item.date);
    });           
},function done (err){
    if (err){
        bot.err("Error: Stream parsing failed.")
    }
    end();         
});


function end(){
    bot.close();
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