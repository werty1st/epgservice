var Sendung = require("./Sendung");

function SenderWeb(db){
    
    this.addVideo = function addVideo (xmlElement, done){

        /**
         * neue sendung anlegen, db übergeben, felder befüllen, bild laden => speichern
         */
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
                
        //console.log("sendung ok");
        //sendungen.push(sendung);
        sendung.getImage( sendung, ()=>{
                //console.log("getImage ok");
                sendung.store( done );
            });
    };
        
    this.addBracket = this.addVideo; /*function addBracket (xmlElement){};*/
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