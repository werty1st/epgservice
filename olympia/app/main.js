/* global process log */
(function (){
'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

global.log = new (winston.Logger)({
    exitOnError: false,
    transports: [
      new DailyRotateFile({datePattern: 'yyyy-MM-dd-',prepend: true, name:"infolog",  level: "info", dirname: "logs", filename: "info.log"  }),
      new DailyRotateFile({datePattern: 'yyyy-MM-dd-',prepend: true, name:"errorlog",  level: "error", dirname: "logs", filename: "error.log"  }),
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
    //loop();
});



// function loop(){
//     setTimeout( ()=>{

//         websender.update(()=>{
//             // done
//             log.info("websender finished");
//             loop();
//         });
        
//     }, 5000);    
// }


function end(code){   
    log.debug('cleanup');        
    process.exit(code);
}

function exitHandler(err) {
    
    process.removeListener('uncaughtException', exitHandler);
    
    log.error("error", err);

    // detect special xml error which occurs randomly
    if(err && err.message && (err.message.search("ECONNREFUSED") > -1) ){
        log.error("DB not reachable");
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
//process.on('exit', exitHandler.bind());

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind());

// catch unhandled Exception
process.on('uncaughtException', exitHandler.bind());


//throw new Error('suicide');

}());