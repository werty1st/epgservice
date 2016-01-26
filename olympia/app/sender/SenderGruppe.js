/* global bot */
var SenderWeb = require("./SenderWeb");
var Sender0 = require("./SenderZDF");

// -> store(/db/tag/channel)

module.exports = function SenderGruppe (db){
   
        
        this.uuid = new Date().getTime();

        this.web  = new SenderWeb(db);
        this.p12  = new Sender0(db);
        
        this.completed = function (sender, cb){
            sender.completed = cb;
        };
        

};
