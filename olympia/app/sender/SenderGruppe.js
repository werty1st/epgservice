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
   
        var self = this;
        //var date = date;
        this.uuid = new Date().getTime();

        this.web1 = new SenderWeb(db);
        this.web2 = new SenderWeb(db);
        this.web3 = new SenderWeb(db);
        this.web4 = new SenderWeb(db);
        this.web5 = new SenderWeb(db);
        this.web6 = new SenderWeb(db);
        this.p12  = new Sender0(db);
             
        var opentag = 0;
        this.storeTag = function storeTag( video /* xml element */) {
          

            //get channel
            var channel = video.$markup.find(item => item.$name == "channel").$markup[0];

            //drop channel <> 1-6
            switch (channel) {
                case "1":
                    self.web1.addVideo(video, ()=>{ console.log("channel 1 saved");});
                    break;
                case "2":
                    self.web2.addVideo(video, ()=>{ console.log("channel 2 saved");});
                    break;
                case "3":
                    self.web3.addVideo(video, ()=>{ console.log("channel 3 saved");});
                    break;
                case "4":
                    self.web4.addVideo(video, ()=>{ console.log("channel 4 saved");});
                    break;
                case "5":
                    self.web5.addVideo(video, ()=>{ console.log("channel 5 saved");});
                    break;
                case "6":
                    self.web6.addVideo(video, ()=>{ console.log("channel 6 saved");});
                    break;
                default:
                    console.log(`channel ${channel} out of bounds`);                      
                    break;
            }
        };        

};