// @flow
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



log.info("Database:",process.env.DB);

zdfsender.update(()=>{
    // done loading data from p12
    log.info("zdfsender finished");
    // ready to sync
    senderGruppe.emit("finished","zdf");
});

websender.update(()=>{
    // done loading data from ecms
    log.info("websender finished");
    // ready to sync
    senderGruppe.emit("finished","web");
});

// debug timeout
setTimeout(()=>{
    // if script takes longer than 3min kill it

    console.log("open req web", websender.openreq());
    console.log("open req zdf", zdfsender.openreq());
    console.log("force quit");
    process.exit(-1);

},180000);


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