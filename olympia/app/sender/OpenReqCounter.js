(function (){
'use strict';

const EventEmitter = require('events');

class OpenReqCounter extends EventEmitter {

    constructor(uuid){
        super();
        
        this.uuid = uuid;
        const self = this;
        
        this.opened = 0;
        this._lastPage = false;
        this._closeTriggerd = false; //requests may be finished befor last page was reached, (no relevant data on the last pages)

        this.on('open', () => {
            this.opened++;
            //log.error("open:",this.opened);
        });
    
        this.on('close', () => {
            this.opened--; 
            this._closeTriggerd = true;
            //log.error("close:",this.opened);
            if( (this.opened===0) && this._lastPage){
                //log.error("empty:",this.uuid,this._lastPage);
                this.emit('empty');
            }
        });    
    }
    
    get lastPage(){
        //console.log("lastPage get",this.uuid,this._lastPage);
        return this._lastPage;
    }
    
    set lastPage(value){
        //console.log("lastPage set",this.uuid,this._lastPage,value);
        this._lastPage = value;
        
        if(this._closeTriggerd){
           if( (this.opened===0) && this._lastPage){
                //log.debug("empty special:",this.uuid,this._lastPage);
                this.emit('empty');
            }            
        }
    }    
}

module.exports = OpenReqCounter;
        
}());