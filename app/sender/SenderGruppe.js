// @flow
/* global process log */

(function (){
'use strict';

        const EventEmitter = require('events');
        const SenderWeb = require("./SenderWeb");
        const SenderZDF = require("./SenderZDF");      

        class SenderGruppe extends EventEmitter {

                constructor(db, sportartenFilter, zdfapi){
                        super();
                        
                        const self = this;
                        
                        let open = 2;
                        
                        this._uuid = new Date().getTime();
                        this._web  = new SenderWeb(db, sportartenFilter);
                        this._zdf  = new SenderZDF(db, zdfapi);                

                        /**
                         * source = web/zdf
                         * called from main after sender.update()
                         */
                        this.on("finished", (source) =>{
                                open--;
                                //log.error("finished event",this.open.size);
                                if (open === 0){
                                        
                                        // trigger db sync
                                        // remove outdated docs
                                        //console.log("outdatedDocs",db.outdatedDocs);
                                        db.sync();
                                        db.removeOutdated(()=>{
                                                self.emit("sync+removeOutdated completed");
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