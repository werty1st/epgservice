function Sender0(db){

    var sendungen = [];


    this.addVideo = function addVideo (xmlElement){

    };
        
    this.addBracket = function addBracket (xmlElement){
        
    };       
}

module.exports = Sender0;

//p12 daten laden mit v2 api für heute+7
// http://www.zdf.de/ZDF/zdfportal/api/v2/epg?station=zdf&startDate=2016-02-04&currentIndex=2 => ZDF SPORTextra - Wintersport - Biathlon-Weltcup

// curl --header "Range: bytes=343-703" "http://www.zdf.de/ZDF/zdfportal/api/v2/epg?station=zdf&startDate=2016-02-04&endDate=2016-02-04&currentIndex=1"

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