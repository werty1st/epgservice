/* global process log */

var winston = require('winston');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

global.log = new (winston.Logger)({
    exitOnError: false,
    transports: [
      new (require('winston-daily-rotate-file'))({ name:"errorlog", level: "error", dirname: "logs", filename: "error.log"  }),
      new (require('winston-daily-rotate-file'))({ name:"infolog",  level: "info", dirname: "logs", filename: "info.log"  }),
      new (winston.transports.Console)({colorize: true, level: process.env.logLevel })
    ]
  });
  
/*{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }*/



//var db = require("./couchdb/db");
var db = require('./couchdb/DbWorker');
var SenderGruppe = require("./sender/SenderGruppe");
var moment = require("moment");


// create new SenderGruppe
var senderGruppe = new SenderGruppe(db);

var websender    = senderGruppe.web;
var zdfsender    = senderGruppe.zdf;

// zdfsender.update(()=>{
//     // done
//     log.info("zdfsender finished");
// });

websender.update(()=>{
    // done
    log.info("websender finished");
});


function end(code){   
    log.debug('cleanup');
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