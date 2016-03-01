var moment = require("moment");
var request = require('request').defaults({ encoding: null });
var async = require("async");
var http = require("http");
var flow = require("xml-flow");
var xpathStream = require('xpath-stream');
var _ = require('underscore');


function SenderZDF(db){

     /**
     * addVideo creates a new Sendung Object and assigns data from xml object
     * after that it collects the Sendungs Preview Image
     * the done callback is passed from main.js@readXMLstream and gets passed to 
     */
    function addSendetermin (xmlElement, done){
        
               
        //var sendung = new Sendung(db);
        var sendung = {};
        
        sendung.externalId      = xmlElement.$attrs["externalId"];
        sendung._id             = xmlElement.$attrs["externalId"];

        sendung.vcmsid          = "vcmsidDummy";
        sendung.vcmsChannelId   = "vcmsChannelIdDummy";
        sendung.copy            = xmlElement.text;
                
        sendung.titel           = xmlElement.titel || "";
        sendung.untertitel      = xmlElement.untertitel || "";
        sendung.dachzeile       = xmlElement.dachzeile || "";
        sendung.start           = xmlElement.beginnDatum;
        sendung.end             = xmlElement.endeDatum;
        sendung.channel         = "zdf";
        
        
        if ( xmlElement.bildfamilie.ref ){
        /**
         * option1
         *   bildfamilie: 
         *      { ref: 'http://www.zdf.de/api/v2/content/p12:5989584',
         *       type: 'VisualFamily' }
         */            
            sendung.imageUrl = "xmlElement.bildfamilie.ref";
        } else if ( xmlElement.bildfamilie.zuschnitte ){
        /** 
         * option2
         *  bildfamilie: 
         *      { visibleFrom: { 'xsi:nil': 'true' },
         *          visibleTo: { 'xsi:nil': 'true' },
         *          zuschnitte: 
         *          { '0': [Object],
         *          '1': [Object]  
         */      
            sendung.imageUrl = "xmlElement.bildfamilie.zuschnitte";  
        } else {
            sendung.imageUrl = "URLdummy";            
        }
                
        /*
        sendung.title           = xmlElement.$markup.find(item => item.$name == "title").$markup[0];
        sendung.copy            = xmlElement.$markup.find(item => item.$name == "copy").$markup[0];
        sendung.start           = xmlElement.$markup.find(item => item.$name == "start").$markup[0];
        sendung.end             = xmlElement.$markup.find(item => item.$name == "end").$markup[0];
        sendung.channel         = "web" + xmlElement.$markup.find(item => item.$name == "channel").$markup[0];
        sendung.image64         = "";
        sendung.sportart = "?";
        */

         console.log(sendung.dachzeile," - ",sendung.imageUrl);
         console.log();
        
         
    }



    //xml stream reader
    /**
     * @param {stream} stream from http get 
     * @param {function} callback to call after stream is closed 
     */
    function readXML(stream, doneXmlCb){

        var xml = flow(stream, {strict:true});
        
        // getNavigation
        stream
            .pipe(xpathStream("EPG//navigation//Navigation//nextPageLink//Link//url//text()"))
            .on('data',(x)=>{
                var unescaped = _.unescape(x);
                //console.log("currentPage:", currentPage++);
                getEpgXml(unescaped);
            });

        // getSendungen
        xml.on('tag:Sendetermin', (x)=>{
            console.log("add sendetermin");
            addSendetermin(x);            
        }); 

        // Stream End
        xml.on("end", () =>{
            //doneXmlCb();        
            console.log("done xml");
            xml = null;
        });
    }
    

    function getEpgXml(url){
        
            console.log("getEpgXml");
            http.get(url, (res) => {
                
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
        var stopd =  moment().add(1, 'days').format("YYYY-MM-DD");
      
        var url = `http://www.zdf.de/ZDF/zdfportal/api/v2/epg?station=zdf&startDate=${startd}&endDate=${stopd}`;
        
        console.log("url",url);
        
        //find
        /**
         * <navigation>    
         * <Navigation>      
         * <currentPage>14</currentPage>
         * <maxPage>14</maxPage>
         * <nextPageLink/> 
         */
        getEpgXml(url);

        

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