(function (){
'use strict';

        const EventEmitter = require('events');
        const SenderWeb = require("./SenderWeb");
        const SenderZDF = require("./SenderZDF");      

        class SenderGruppe extends EventEmitter {

                constructor(db){
                        super();
                        
                        const self = this;
                        
                        let open = 2;
                        
                        this._uuid = new Date().getTime();
                        this._web  = new SenderWeb(db);
                        this._zdf  = new SenderZDF(db);                

                        this.on("ready", (source) =>{
                                open--;
                                //log.error("ready event",this.open.size);
                                if (open === 0){
                                        
                                        // trigger db sync
                                        // remove outdated docs
                                        //console.log("outdatedDocs",db.outdatedDocs);
                                        db.sync();
                                        db.removeOutdated(()=>{
                                                self.emit("completed");
                                        });
                                }
                        } );
                }
                
                
                get web(){
                        return this._web;
                }
                
                get zdf(){
                        return this._zdf;
                }
                
                get uuid(){
                        return this._uuid;
                }

        }

module.exports = SenderGruppe;
}());