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