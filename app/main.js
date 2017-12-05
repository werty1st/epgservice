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
                    

    const p1 = new Promise( (resolve, reject) => {
        zdfsender.update(resolve);
        // ready to sync
    });

    const p2 = new Promise( (resolve, reject) => {
        websender.update(resolve);
        // ready to sync
    });


    Promise.all([p1,p2]).then(values=>{
        // trigger db sync
        // remove outdated docs
        //console.log("outdatedDocs",db.outdatedDocs);
        db.sync();
        db.removeOutdated(()=>{
            log.info("sync+removeOutdated completed");
            clearTimeout(fallbackstop);
            log.info("timeout cleared");
        });
    })

    // debug timeout
    const fallbackstop = setTimeout(()=>{
        // if script takes longer than 3min kill it
        console.log("force quit");
        process.exit(-1);
    },1000*60*3);
}

//run on start
main();
//run every 10 minutes
setInterval(main,1000*60*10)
//setInterval(main,1000*10)



}());