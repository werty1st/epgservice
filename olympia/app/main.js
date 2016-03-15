/* global process log */

var db = require("./couchdb/db");
var SenderGruppe = require("./sender/SenderGruppe");
var moment = require("moment");
var bunyan = require('bunyan'), bformat = require('bunyan-format'), formatOut = bformat({ outputMode: 'short' });
var log = bunyan.createLogger({
    name: 'epgservice/olympia/main',
    stream: formatOut,
    //stream: process.stderr,
    level: process.env.logLevel
    });
/*fatal (60) error (50) warn (40) info (30) debug (20) trace (10)*/

// create new SenderGruppe
var senderGruppe = new SenderGruppe(db);

var websender    = senderGruppe.web;
var zdfsender    = senderGruppe.zdf;

zdfsender.update(()=>{
    // done
    log.debug("zdfsender finished");
});

websender.update(()=>{
    // done
    log.debug("websender finished");
});


function end(code){
    process.exit(code);
}

function exitHandler(options, err) {
    if (options.cleanup) console.log('clean');
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catch unhandled Exception
process.on('uncaughtException', (err) => {
    log.fatal("uncaughtException",err);
    end();
});