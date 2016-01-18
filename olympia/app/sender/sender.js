//setChannel
//setDate
//addSendung
//  getImage
//getJson

/* global bot */

// -> store(/db/tag/channel)

function Sender(stationID){

    var sendungen = [];


    this.addVideo = function addVideo (xmlElement){

    };
        
    this.addBracket = function addBracket (xmlElement){
        
    };       
}


module.exports = function SenderGruppe (date){
   
        //var date = date;
        this.uuid = new Date().getTime();

        this.web1 = new Sender(1/** stationID */);
        this.web2 = new Sender(2/** stationID */);
        this.web3 = new Sender(3/** stationID */);
        this.web4 = new Sender(4/** stationID */);
        this.web5 = new Sender(5/** stationID */);
        this.web6 = new Sender(6/** stationID */);
             

};