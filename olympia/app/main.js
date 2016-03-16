/* global process log */

var db = require("./couchdb/db");
var SenderGruppe = require("./sender/SenderGruppe");
var moment = require("moment");
var winston = require('winston');


var log = new (winston.Logger)({
    exitOnError: false,
    transports: [
      new (winston.transports.Console)({colorize: true, level: process.env.logLevel}),
     /* new (winston.transports.File)({ level: process.env.logLevel, filename: "../somefile.log"  }),
      new (winston.transports.File)({
        name: 'info-file',
        filename: 'filelog-info.log',
        level: 'info'
      }),
      new (winston.transports.File)({
        name: 'error-file',
        filename: 'filelog-error.log',
        level: 'error'
      })*/
    ]
  });
/*{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }*/

global.openLogs = [];

log.on('logging', function (transport, level, msg, meta) {
// [msg] and [meta] have now been logged at [level] to [transport]
    //console.log("winston");
}); 


// create new SenderGruppe
var senderGruppe = new SenderGruppe(db);

var websender    = senderGruppe.web;
var zdfsender    = senderGruppe.zdf;

zdfsender.update(()=>{
    // done
    log.info("zdfsender finished");
});

websender.update(()=>{
    // done
    log.info("websender finished");
});


function end(code){
    
    /*    
    for(var property in openLogs){
        var sendung = openLogs[property];

        if(Object.keys(sendung).length < 3 ){
            console.log(property,sendung);
        }
    }*/
    
    log.info('cleanup');
    process.exit(code);
}

function exitHandler(err) {
    
    process.removeListener('uncaughtException', exitHandler);
    
    //log.error("error", err);

    // detect special xml error which occurs randomly
    if(err && err.message && (err.message.search("Unclosed root tag") > -1) ){
        log.error("Unclosed root tag",err);
        return end(15); 
    }
    
    if (err){
        // all other Exceptions
        log.error("uncaughtException",err);
        return end(2);         
    }
    
    end(0); //=>
}

// do something when app is closing
process.on('exit', exitHandler.bind());

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind());

// catch unhandled Exception
process.on('uncaughtException', exitHandler.bind());


//throw new Error('suicide');