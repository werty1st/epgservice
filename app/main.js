// @flow
/* global process log */

(function (){
'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const log = require('./log.js'); 
const ZDFApi = require('./../api/api.js');

const API_CLIENT = process.env.apiclient;
const API_SECRET = process.env.apisecret;
const API_HOST   = process.env.apihost;
const zdfapi = new ZDFApi(API_CLIENT, API_SECRET, API_HOST);

/*{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }*/

const db = require('./couchdb/DbWorker');
const SenderGruppe = require("./sender/SenderGruppe");
const sportartenFilter = require("./sender/SportartenFilter");
//const moment = require("moment");


// create new SenderGruppe
const senderGruppe = new SenderGruppe(db, sportartenFilter, zdfapi);
const websender    = senderGruppe.web;
const zdfsender    = senderGruppe.zdf;



log.setting("Database:",process.env.DB);

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

senderGruppe.on("sync+removeOutdated completed",()=>{
    log.info("sync+removeOutdated completed");
    clearTimeout(fallbackstop);
    //process.exit(0);
});

// debug timeout
const fallbackstop = setTimeout(()=>{
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