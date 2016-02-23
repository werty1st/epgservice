var moment = require("moment");
var request = require('request').defaults({ encoding: null });
var async = require("async");
var https = require("https");
var flow = require("xml-flow");


function SenderZDF(db){


    //xml stream reader
    /**
     * @param {stream} stream from http get 
     * @param {function} callback to call after stream is closed 
     */
    function readXML(stream, storeTagFn, doneXmlCb){
        var xml = flow(stream, "utf8");
        
        xml.on('tag:EPG', (x)=>{
            console.log("nextPageLink",x);            
        }); 
        
        
        xml.on("end", () =>{
            //doneXmlCb();        
            console.log("done xml",stream);            
                   
            xml = null;
        });
    }
    

    function getPage(url){
        
            console.log("getPage");
            https.get(url, (res) => {
                
                if (res.statusCode != 200){
                    console.log(`Got response: ${res.statusCode} from ${url}`);
                } else {
                    //send to xml stream reader                   
                    readXML(res);
                }
            }).on('error', (e) => {
                console.log(`Error in response: ${res}`);
            });         
                
    }

    /**
     * Genrate URLs based on DateTime.now() from Today-1 to Today+30 
     * 
     */
    this.update = function update(){
        var startd = moment().subtract(1, 'days').format("YYYY-MM-DD");
        var stopd =  moment().add(30, 'days').format("YYYY-MM-DD");
      
        var url = `https://www.zdf.de/ZDF/zdfportal/api/v2/epg?station=zdf&startDate=${startd}&endDate=${stopd}`;
        
        console.log("url",url);
        
        //find
        /**
         * <navigation>    
         * <Navigation>      
         * <currentPage>14</currentPage>
         * <maxPage>14</maxPage>
         * <nextPageLink/> 
         */
        getPage(url);

        

    };
        
}

module.exports = SenderZDF;








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