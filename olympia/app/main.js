/* global process bot global */
var moment = require("moment");
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'epgservice/Olympia/main'});

// startdate event
var startdate = "2014-02-06";
//var startdate = "2014-02-12"; //demo 3 tage

// enddate event
var enddate = "2014-02-23";
//var enddate = "2014-02-14"; //demo 3 tage

// live
//var current = moment();
// simulate date before event
var current = "2014-02-06";
//var current = "2014-02-12";


/**
 * delta berechnen und dann allen datumsanagben draufrechnen
 * heute - 2014-02-12 = x days
 */
var delta = global.delta = moment().diff(moment("2014-02-06"), "days") ;
    console.log("Delta:",delta);
    console.log("Delta:",process.env.DB);


var options = { proto: "https",
                 host: "eventcms.zdf.de",
                 path: "/xml/olympia2014/epg/" };


// imports
var Parallel = require('paralleljs');
var https = require("https");
var db = require("./couchdb/db");
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



// sportarten mapping
//https://ecms.zdf.de/xml/olympia2014/sports.xml

// debug 1 item only
//urls.urls = urls.urls.splice(urls.urls.length-1);        
//console.log(urls); end();

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


    zdfsender.update();

// fetch xml from url

return;

var sc=0;

// web channels
// create new https client
var fetchXML = require("./xml/fetchXML")(options);

async.forEachOf(urls.urls, function(item, key, asyncDone){

    
    fetchXML.get(item.url, function(stream){
        
        // print current stream #
        process.stdout.write(`Stream #${++sc} from: ${item.date.format("YYYY-MM-DD")}: `);
             
        // pipe xml Stream to SenderGruppe
        readXMLstream(stream, websender.passElementFn, ()=>{
            
                // xml parsing done
                // saving to couchdb is still in progress at this point
                               
                // this stream is empty now
                console.log("done");
                
                // asyncDone internally counts open streams
                asyncDone();                 
        });
    });               
},function (err){
    if (err){
        bot.error("Error: Stream parsing failed.");
    } else {
        // notify senderGruppe about that
        console.log("Xml parsing done");        
    }
});


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