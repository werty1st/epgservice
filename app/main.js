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
//dont stop refresh task
//zdfapi.once("token-ready",zdfapi.stopTokenRefreshTask);


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

function main(){

    console.log(new Date().toString());

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

    senderGruppe.once("sync+removeOutdated completed",()=>{
        log.info("sync+removeOutdated completed");
        clearTimeout(fallbackstop);
    });

    // debug timeout
    const fallbackstop = setTimeout(()=>{
        // if script takes longer than 3min kill it
        console.log("force quit");
        process.exit(-1);
    },180000);
}

//run on start
main();
//run every 10 minutes
setInterval(main,1000*60*10)
//setInterval(main,1000*10)



}());