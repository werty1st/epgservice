var moment  = require("moment");
var request = require('request').defaults({ encoding: null });
var async = require("async");
var http  = require("http");
var flow  = require("xml-flow");
var xpathStream = require('xpath-stream');
var _ = require('underscore');
var bunyan = require('bunyan'), bformat = require('bunyan-format'), formatOut = bformat({ outputMode: 'short' });


var log = bunyan.createLogger({
    name: 'epgservice/olympia/sender/zdf',
    stream: formatOut
    });



function SenderZDF(db){
    
    var opentag = 0;
    var senderO = this;

     /**
     * addVideo creates a new Sendung Object and assigns data from xml object
     * after that it collects the Sendungs Preview Image
     * the done callback is passed from main.js@readXMLstream and gets passed to 
     */
    function addSendetermin (xmlElement, done){
        
        opentag++;
        
        var sendung = {};
        
        sendung.externalId      = xmlElement.$attrs["externalId"];
        sendung._id             = xmlElement.$attrs["externalId"];

        sendung.vcmsid          = "1822600";
        sendung.vcmsChannelId   = "74";
        sendung.copy            = xmlElement.text;
                
        sendung.titel           = xmlElement.titel || "";
        sendung.untertitel      = xmlElement.untertitel || "";
        sendung.dachzeile       = xmlElement.dachzeile || "";
        sendung.start           = xmlElement.beginnDatum;
        sendung.end             = xmlElement.endeDatum;
        sendung.station         = "zdf";
        
        // 378x672
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
            console.log("URLdummy");          
        }
        
        /**
         *     3
         *  <bildfamilie>        
         *  <AutoVisualFamily>      
         */
                
        /**
         * load image from sendung.url
         * callback is called after image is loaded
         */
        getImageUrl( sendung, ()=>{
            
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
            
        });          
    }


    function getImageUrl(sendung,callback){
        callback();
    }


    //xml stream reader
    /**
     * @param {stream} stream from http get 
     */
    function parseXml(stream){

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
        xml.on('tag:Sendetermin', (xml)=>{
            addSendetermin(xml, ()=>{
                opentag--;
                if (opentag===0){
                    senderO.completed();
                }                
            });            
        }); 

        // Stream End
        xml.on("end", () =>{
            //console.log("done xml");
            xml = null;
        });
    }
    
    //xml download
    /**
     * @param {string} url download xml  
     */
    function getEpgXml(url){

        http.get(url, (responeStream) => {

            if (responeStream.statusCode != 200){
                console.error(`Got invalid response: ${responeStream.statusCode} from ${url}`);
            } else {
                //send to xml stream reader                   
                parseXml(responeStream);
            }
        }).on('error', (e) => {
            console.error(`Error in response: from ${url}`);
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
        
        console.log("Download:",url);
        
        //find
        /**
         * <navigation>    
         * <Navigation>      
         * <currentPage>14</currentPage>
         * <maxPage>14</maxPage>
         * <nextPageLink/> 
         */
        getEpgXml(url,(done)=>{
            //callback after xml stream is read
            console.log("xml done");
        });

        

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