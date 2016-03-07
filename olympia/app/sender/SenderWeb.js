var moment = require("moment");
var https = require("https");
var flow  = require("xml-flow");
var request = require('request').defaults({ encoding: null });
var bunyan = require('bunyan');
var bunyan = require('bunyan'), bformat = require('bunyan-format'), formatOut = bformat({ outputMode: 'short' });


var log = bunyan.createLogger({
    name: 'epgservice/olympia/sender/web',
    stream: formatOut
    });

function SenderWeb(db){
    
    var opentag = 0;
    var senderO = this;
        
    /**
     * passElementFn is passed to the xml parser
     * it receives a xml video/bracket element and stores it to its corresponding 
     * channel (web[web1-6, p12[Hauptprogramm])
     * at this time it is possible to reduce 
     */
    function passElementFn( video ) {

        //get channel
        var channel = video.channel;

        //drop channel <> 1-6
        switch (channel) {
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
                addSendetermin(video, ()=>{ 
                    opentag--;
                    if (opentag===0){
                        senderO.completed();
                    }
                });
                break;
            default:
        }
    };
    

    /**
     * addSendetermin creates a new Sendung Object and assigns data from xml object
     * after that it collects the Sendungs Preview Image
     * the done callback is passed from main.js@readXMLstream and gets passed to 
     */
    function addSendetermin (xmlElement, done){
        
        opentag++;
               
        var sendung = {};
        
        sendung.ecmsid           = xmlElement.$attrs["ecms-id"];
        sendung.vcmsid           = xmlElement.$attrs["vcms-id"];
        sendung._id              = xmlElement.$attrs["vcms-id"]; //doc id
        sendung.vcmsChannelId    = xmlElement.$attrs["vcms-channel-id"];
        sendung.typicalId        = xmlElement.$attrs["typical-id"];
        sendung.title            = xmlElement.title;
        sendung.copy             = xmlElement.copy;
        sendung.start            = xmlElement.start;
        sendung.end              = xmlElement.end;
        sendung.station          = "web" + xmlElement.channel;
        sendung.externalImageUrl = `http://www.zdf.de/ZDFmediathek/contentblob/${sendung.vcmsid}/timg485x273blob`;


        /**
         * TODO: remove
         * add delta to get current sendungen
         */
        log.info("modify date",delta);
        sendung.start = moment(sendung.start).add(delta, 'days').format(); 
        sendung.end   = moment(sendung.end  ).add(delta, 'days').format();
        


        // store sendung to db
        db.store(sendung, (err)=>{
            if (err){
                log.error("Error saving Sendung: ", err);
            }                
            // store to db complete
            done();
            // delete sendung Obj
            sendung = null;
        });

    }



    //xml stream reader
    /**
     * @param {stream} stream from http get 
     */
    function parseXml(stream){

        var xml = flow(stream, {strict:true});
         
        xml.on('tag:video', passElementFn); 
        xml.on('tag:bracket', passElementFn);  
         
        
        xml.on("end", () =>{
            xml = null;
        });
    }
    
    //xml download
    /**
     * @param {string} url download xml  
     */
    function getEpgXml(url){
        
        https.get(url, (res) => {
            
            if (res.statusCode != 200){
                log.error(`Got response: ${res.statusCode} from ${url}`);
            } else {
                //send to xml stream reader
                parseXml(res);   
            }

        }).on('error', (e) => {
            log.error(`Got error: ${e.message}`);
        });   


    }



    /**
     * Genrate URLs based on DateTime.now() from Today-1 to Today+30 
     * 
     */
    this.update = function update(options){


        for (var url of options.urls) {
            getEpgXml(url);
        }

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