(function (){
'use strict';

const EventEmitter = require('events');

class OpenReqCounter extends EventEmitter {

    constructor(next){
        super();
        
        this.opened = 0;
        this.last_page = false;
        this.next = next;

        this.on('open', () => {
            this.opened++;
            //log.error("open:",opened);
        });
    
        this.on('close', () => {
            this.opened--; 
            if(this.opened===0)
                this.emit('empty');
        });    
    
        this.on('empty', () => {
            if (this.last_page){
                if (this.next) this.next();
            }
            log.debug("all requests finished");
        });        
    }
}

module.exports = OpenReqCounter;
        
}());