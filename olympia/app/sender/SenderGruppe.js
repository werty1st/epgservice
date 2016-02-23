/* global bot */
var SenderWeb = require("./SenderWeb");
var SenderZDF = require("./SenderZDF");

// -> store(/db/tag/channel)

module.exports = function SenderGruppe (db){
   
        
        this.uuid = new Date().getTime();

        this.web  = new SenderWeb(db);
        this.zdf  = new SenderZDF(db);
        
        this.completed = function (sender, cb){
            sender.completed = cb;
        };
        

};
