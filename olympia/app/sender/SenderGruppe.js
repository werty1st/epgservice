//setChannel
//setDate
//addSendung
//  getImage
//getJson

/* global bot */

var SenderWeb = require("./SenderWeb");
var Sender0 = require("./Sender0");


// -> store(/db/tag/channel)


module.exports = function SenderGruppe (db){
   
        //var date = date;
        this.uuid = new Date().getTime();

        this.web1 = new SenderWeb(db);
        this.web2 = new SenderWeb(db);
        this.web3 = new SenderWeb(db);
        this.web4 = new SenderWeb(db);
        this.web5 = new SenderWeb(db);
        this.web6 = new SenderWeb(db);
        this.p12  = new Sender0(db);
             

};