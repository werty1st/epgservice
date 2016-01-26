var moment = require("moment");
var request = require('request').defaults({ encoding: null });





function SenderWeb(db){
    
    var opentag = 0;
    var sc = 0;
    var senderO = this;
        
    /**
     * passElementFn is passed to the xml parser
     * it receives a xml video/bracket element and stores it to its corresponding 
     * channel (web[web1-6, p12[Hauptprogramm])
     * at this time it is possible to reduce 
     */
    this.passElementFn = function passElementFn( video ) {
        
        //get channel
        var channel = video.$markup.find(item => item.$name == "channel").$markup[0];

        //drop channel <> 1-6
        switch (channel) {
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
                addVideo(video, ()=>{ 
                    opentag--;
                    if (opentag===0){
                        console.log();
                        senderO.completed();
                    }
                });
                break;
            default:
        }
    };
    

    /**
     * addVideo creates a new Sendung Object and assigns data from xml object
     * after that it collects the Sendungs Preview Image
     * the done callback is passed from main.js@readXMLstream and gets passed to 
     */
    function addVideo (xmlElement, done){
        
        opentag++;
               
        var sendung = new Sendung(db);
        
        sendung.ecmsid          = xmlElement.$attrs["ecms-id"];
        sendung.vcmsid          = xmlElement.$attrs["vcms-id"];
        sendung._id             = xmlElement.$attrs["vcms-id"]; //doc id
        sendung.vcmsChannelId   = xmlElement.$attrs["vcms-channel-id"];
        sendung.typicalId       = xmlElement.$attrs["typical-id"];
        sendung.title           = xmlElement.$markup.find(item => item.$name == "title").$markup[0];
        sendung.copy            = xmlElement.$markup.find(item => item.$name == "copy").$markup[0];
        sendung.start           = xmlElement.$markup.find(item => item.$name == "start").$markup[0];
        sendung.end             = xmlElement.$markup.find(item => item.$name == "end").$markup[0];
        sendung.channel         = "web" + xmlElement.$markup.find(item => item.$name == "channel").$markup[0];
        sendung.image64         = "";
        //sendung.sportart = "?";


        /**
         * TODO: remove
         * add delta to get current sendungen
         */
        sendung.start = moment(sendung.start).add(delta, 'days').format(); 
        sendung.end   = moment(sendung.end  ).add(delta, 'days').format();
        

        /**
         * load image from sendung.url
         * callback is called after image is loaded
         */
        sendung.getImage( sendung, ()=>{
           
            
            // store sendung to db
            sendung.store( ()=>{
               
                process.stdout.cursorTo(0);
                process.stdout.write(`Get Image #${++sc}`);
                                
                // store to db complete
                done();
                // delete sendung Obj
                sendung = null;
                    
            } );
            
        });
        
         
    }
    
      
    
    /**
     * bracket contains the same items as video
     * as long as no special handling for bracket or video is needed 
     * the video function can be used
     */
    this.addBracket = this.addVideo; /*function addBracket (xmlElement){};*/
}

/**
 * Felder einer Sendung(db)
 * getImage() lädt Vorschaubild nach
 * store() speichert Sendung mit Bild in db
 */
function Sendung(db){

    this.getImage = function getImage( sendung, done ){

        //var url = `http://www.zdf.de/ZDFmediathek/contentblob/${sendung.vcmsid}/timg485x273blob`;
        var url = `https://placeholdit.imgix.net/~text?txtsize=33&txt=${new Date().toISOString()}&w=485&h=273`;
        request.get(url, (error, response, body) => {
            
            if (!error && response.statusCode == 200) {
                sendung.image64 = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
            }
            
            // if placeholdit wont answer set default image
            if (sendung.image64 === ""){
                // retry
                console.log("response error", response.statusCode);
                sendung.image64 = "data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
            }            
            
            // callback image load complete
            done();
            
        });        
    };
    
    this.store = function store ( done ){
        //console.log("store ok");
        db.store( JSON.parse(JSON.stringify(this)), done );
    };    
}

module.exports = SenderWeb;



//endpunkte definieren

/* EPG_Olympia
 * web1,web2, ..., zdf,  zdfneo, dreisat, kika, arte
sofa01.zdf.de/epgservice/events/web[1..6]/heute/json
sofa01.zdf.de/epgservice/events/all/heute/json
...

*/

/* EPGNG
sofa01.zdf.de/epg/heute/zdf/

sofa01.zdf.de/epg/heute/alle/
sofa01.zdf.de/epg/gestern/alle/
sofa01.zdf.de/epg/morgen/alle/

sofa01.zdf.de/epg/heute+1/alle/
sofa01.zdf.de/epg/heute+2/alle/
sofa01.zdf.de/epg/heute+3/alle/
sofa01.zdf.de/epg/heute+4/alle/
sofa01.zdf.de/epg/heute+5/alle/
sofa01.zdf.de/epg/heute+6/alle/
sofa01.zdf.de/epg/heute+7/alle/

sofa01.zdf.de/epg/heute+7/alle/zdf/{sendungID}/titel
sofa01.zdf.de/epg/heute+7/alle/zdf/{sendungID}/bilder/{small}
sofa01.zdf.de/epg/heute+7/alle/zdf/{sendungID}/bilder/{large}

*/