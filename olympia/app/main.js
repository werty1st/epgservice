/* global process log */
(function (){
'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const winston = require('winston');

global.log = new (winston.Logger)({
    exitOnError: false,
    transports: [
      new (winston.transports.Console)({colorize: true, level: process.env.logLevel })
    ]
  });
  
/*{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }*/

const db = require('./couchdb/DbWorker');
const SenderGruppe = require("./sender/SenderGruppe");
const moment = require("moment");


// create new SenderGruppe
const senderGruppe = new SenderGruppe(db);

const websender    = senderGruppe.web;
const zdfsender    = senderGruppe.zdf;

// senderGruppe.on("completed", ()=>{
//     log.info("finished all");
// });

zdfsender.update(()=>{
    // done
    log.info("zdfsender finished");
    senderGruppe.emit("ready","zdf");
});

websender.update(()=>{
    // done
    log.info("websender finished");
    senderGruppe.emit("ready","web");
});


function end(code){   
    log.debug('cleanup');        
    process.exit(code);
}

function exitHandler(err) {
    
    process.removeListener('uncaughtException', exitHandler);
    process.removeListener('exit', exitHandler);
    process.removeListener('SIGINT', exitHandler);
    
    if (err){
        // all other Exceptions
        log.debug(err);
        end();         
    } else {
        log.info("shutdown");
        process.exit(0);
    }
    
}

// do something when app is closing
process.on('exit', exitHandler.bind());

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind());

// catch unhandled Exception
process.on('uncaughtException', exitHandler.bind());


//throw new Error('suicide');

}());