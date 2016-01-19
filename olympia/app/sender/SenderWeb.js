var Sendung = require("./Sendung");

function SenderWeb(db){
    
    this.addVideo = function addVideo (xmlElement, done){

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
        sendung.channel         = xmlElement.$markup.find(item => item.$name == "channel").$markup[0];
        sendung.image64         = "";
                
        //console.log("sendung ok");
        //sendungen.push(sendung);
        sendung.getImage( sendung );
    };
        
    this.addBracket = this.addVideo; /*function addBracket (xmlElement){};*/
}

module.exports = SenderWeb;

//p12 daten laden mit v2 api für heute+7

//nur olympia aber vorbereiten für alles



//Ziel definieren

/* EPG_Olympia
sofa01.zdf.de/epgservice/olympia/web[1..6]/heute/json
sofa01.zdf.de/epgservice/olympia/all/heute/json
...

*/

/* EPGNG
sofa01.zdf.de/epg-ng/heute/zdf/

sofa01.zdf.de/epg-ng/heute/alle/
sofa01.zdf.de/epg-ng/gestern/alle/
sofa01.zdf.de/epg-ng/morgen/alle/

sofa01.zdf.de/epg-ng/heute+1/alle/
sofa01.zdf.de/epg-ng/heute+2/alle/
sofa01.zdf.de/epg-ng/heute+3/alle/
sofa01.zdf.de/epg-ng/heute+4/alle/
sofa01.zdf.de/epg-ng/heute+5/alle/
sofa01.zdf.de/epg-ng/heute+6/alle/
sofa01.zdf.de/epg-ng/heute+7/alle/

sofa01.zdf.de/epg-ng/heute+7/alle/zdf/{sendungID}/titel
sofa01.zdf.de/epg-ng/heute+7/alle/zdf/{sendungID}/bilder/{small}
sofa01.zdf.de/epg-ng/heute+7/alle/zdf/{sendungID}/bilder/{large}

*/