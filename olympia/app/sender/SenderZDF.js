var moment  = require("moment");
var async = require("async");
var http  = require("http");
var https  = require("https");
var flow  = require("xml-flow");
var xpathStream = require('xpath-stream');
var _ = require('underscore');



function SenderZDF(db){
    'use strict';
    
    const EventEmitter = require('events');
    class OpenReqCounter extends EventEmitter {}
    
    var opened = 0;
    var last_page = false;
    var senderO = this;
    var finished;
    var agent;
    var request;
    
    const openReqCounter = new OpenReqCounter();
    
    openReqCounter.on('open', () => {
        opened++;
        //log.error("open:",opened);
    });
    
    openReqCounter.on('close', () => {
        opened--; 
        if(opened===0)
            openReqCounter.emit('empty');
    });    
    
    openReqCounter.on('empty', () => {
        if (last_page){
            if (finished) finished();
        }
        log.debug("all requests finished");
    });
    
    

     /**
     * addVideo creates a new Sendung Object and assigns data from xml object
     * after that it collects the Sendungs Preview Image
     * the done callback is passed from main.js@readXMLstream and gets passed to 
     */
    function addSendetermin (sendung, done){
        
        //sendung.externalId
        //sendung.start
        //sendung.end
        
        sendung.station         = "zdf";
        sendung.vcmsid          = "1822600";
        sendung.vcmsChannelId   = "74";
        sendung._id             = sendung.externalId;
        sendung.text            = (sendung.copy       === undefined)?"" : sendung.copy;
        sendung.titel           = (sendung.titel      === undefined)?"" : sendung.titel;
        sendung.untertitel      = (sendung.untertitel === undefined)?"" : sendung.untertitel;
        sendung.dachzeile       = (sendung.dachzeile  === undefined)?"" : sendung.dachzeile;
        sendung.moderator       = "";
                        
        getImageUrl(sendung, ()=>{
   
            delete sendung.bildfamilie;
            // store sendung to db
            db.store(sendung, (err)=>{
                if (err){
                    log.error("Error saving Sendung: ", err);
                }                
                // store to db complete
                done();
                //log.debug(`id ${sendung._id} saved. open: ${opened}`);                
            });
        });          
    }


    /**
     * load image from sendung.url
     * callback is called after image is loaded
     */
    function getImageUrl(sendung, callback){
        
        // sendetermin.bildfamilie.Beitrag_Reference/epg
        if ( !(sendung.bildfamilie && sendung.bildfamilie.Beitrag_Reference)){
            log.error(`getImageUrl: no valid image url`);
            sendung.externalImageUrl = "";
            callback();    
            return;        
        }    
               
        var get_options = require('url').parse(sendung.bildfamilie.Beitrag_Reference);
            get_options.headers = {'User-Agent': agent};

        request.get(get_options, (responeStream) => {

            if (responeStream.statusCode != 200){
                log.error(`getImageUrl: Got invalid statusCode`);
                sendung.externalImageUrl = "";
                callback();
            } else {
                
                if (responeStream.headers['content-length'] == 0){
                    log.error(`getImageUrl: Got emtpy response`);
                    sendung.externalImageUrl = "";
                    callback();
                    return;
                }
                
                // send to xml stream reader                  
                var found=false;
                responeStream
                    .pipe(xpathStream("//image/Link/url/text()"))
                    .on('data',(imageList)=>{
                        
                        // filter required image urls from response 
                        var url = imageList.filter((item)=>{
                            if( (item.search("layout=672x378")>-1) || (item.search("timg672x378blob")>-1) ) return true; 
                        });      

                        if (url.length > 0){
                            found=true;
                            // return the first image
                            sendung.externalImageUrl = url[0];
                            callback();
                        }
                    })
                    .on("end",()=>{
                        // no valid url found try next
                        if(!found){
                            getImageUrl2 (sendung, callback);                    
                        }
                    });                

            }
        }).on('error', (e) => {
            log.error(`Error in response: from ${url}`);
            sendung.externalImageUrl = "";
            callback();            
        });
    }

    /**
     * load image from sendung.url
     * callback is called after image is loaded
     */
    function getImageUrl2 (sendung, callback){
        
        // sendetermin.bildfamilie.VisualFamily_Reference
               
        if ( !(sendung.bildfamilie && sendung.bildfamilie.VisualFamily_Reference)){
            log.error(`getImageUrl2: no valid image url`);
            sendung.externalImageUrl = "";
            callback();
            return;            
        }
               
        var get_options = require('url').parse(sendung.bildfamilie.VisualFamily_Reference);
            get_options.headers = {'User-Agent': agent};

        request.get(get_options, (responeStream) => {

            if (responeStream.statusCode != 200){
                log.error(`getImageUrl2: Got invalid statusCode`);
                sendung.externalImageUrl = "";
                callback();
            } else {
                
                if (responeStream.headers['content-length'] == 0){
                    log.error(`getImageUrl2: Got emtpy response`);
                    sendung.externalImageUrl = "";
                    callback();
                    return;
                }
                //send to xml stream reader                        
                var found=false;      
                
                responeStream
                    //.pipe(xpathStream("//Zuschnitt[/breite/text()='1358']",{
                    .pipe(xpathStream("//image/Link",{
                        url: "url/text()",
                        width: "../../breite/text()",
                        height: "../../hoehe/text()"
                    }))
                    .on('data',(imageList)=>{

                        // filter required image urls from response 
                        var url = imageList.filter((item)=>{
                            if( (item.width === "672") && (item.height === "378") ) return true; 
                        });      
                        
                        if (url.length > 0){
                            found=true;
                            // return the first image
                            sendung.externalImageUrl = url[0].url;
                            callback();
                        }
                    })
                    .on('end', () => {
                        if(!found){
                            log.error("getImageUrl2: no matching urls found");
                            sendung.externalImageUrl = "";
                            callback(); 
                        }
                    });                
            }
        }).on('error', (e) => {
            log.error(`Error in response: from ${url}`);
            sendung.externalImageUrl = "";
            callback();            
        });
    }


    //xml stream parser
    /**
     * @param {stream} stream from http get.
     * passes sendungen to addSendetermin
     */
    function parseXmlStream(stream){
        
        var has_data=false;

        // get Navigation
        stream
            .pipe(xpathStream("/EPG/navigation/Navigation/nextPageLink/Link/url/text()"))
            .on('data',(x)=>{
                has_data = true;
                var unescaped = _.unescape(x);
                getXmlStream(unescaped);
            })
            .on("end",()=>{
                if(!has_data){
                    last_page = true;    
                }
            });    
       
        // callback func used in for loop
        function addSendeterminDone(sendung){
            
            return function(){
                log.debug("close",sendung.start,"-",sendung.titel);
                openReqCounter.emit('close');
            };
        }

        // get Sendungen
        stream
            .pipe(xpathStream("/EPG/treffer/Sendetermin",{
                externalId: "./@externalId",
                copy: "text/text()",
                titel: "titel/text()",
                untertitel: "untertitel/text()",
                dachzeile: "dachzeile/text()",
                start: "beginnDatum/text()",
                kategorien: "sendungsinformation/Sendungsinformation/kategorien/text()",
                end: "endeDatum/text()",
                bildfamilie:{
                  Beitrag_Reference: "epgBeitrag/Beitrag_Reference/@ref",
                  VisualFamily_Reference  : "bildfamilie/VisualFamily_Reference/@ref"
                }
            }))
            .on('data',(result)=>{
 
                // array of Sendetermin
                for(var i = 0; i< result.length; i++){
                    
                    var sendung = result[i];
                    // xml with zuschnitten => http://www.zdf.de/api/v2/content/p12:21698990
                    if ( (!sendung.bildfamilie.Beitrag_Reference) && (!sendung.bildfamilie.VisualFamily_Reference) ){
                        log.error("No images found in:", sendung.externalId);                       
                    }
                
                    log.debug("open ",sendung.start,"-",sendung.titel);
                    if (sendung.kategorien)
                        log.info("open kategorien",sendung.kategorien);
                        
                    // find sport emission
                    var sport = sendung.titel.split(/,| /).find(x=>{
                        if ((x.toLowerCase() === "uefa") ||
                            (x.toLowerCase() === "fifa") ||
                            (x.toLowerCase() === "sport") ||
                            (x.toLowerCase() === "wintersport") ||
                            (x.toLowerCase() === "leichtathletik") ||
                            (x.toLowerCase() === "olympia"))
                        return true;
                    });
                    
                    // sport found. add it
                    if (sport !== undefined){                        
                        openReqCounter.emit("open");
                        addSendetermin(sendung, addSendeterminDone(sendung) );                    
                    }
                                        
                }
            });    
    }
    
    //xml download
    /**
     * @param {string} url download xml  
     * passes xml stream to parseXmlStream
     */
    function getXmlStream(url){

        log.info("Download:",url);

        var get_options = require('url').parse(url);
        get_options.headers = {
                'User-Agent': agent,
                'Cache-Control': 'no-cache'
            };

        request.get(get_options, (responeStream) => {

            if (responeStream.statusCode != 200){
                log.error(`getXmlStream: Got invalid statusCode`);
                return;
            } else {
                
                if (responeStream.headers['content-length'] == 0){
                    log.error(`getXmlStream: Got emtpy response`);
                    return;
                }
                //send to xml stream reader                   
                parseXmlStream(responeStream);
            }
        }).on('error', (e) => {
            log.error(`Error in response: from ${url}`);
        });
    }

    /**
     * Genrate URLs based on DateTime.now() from Today-1 to Today+30 
     * 
     */
    this.update = function update(done){

        finished = done;
        agent = process.env.npm_package_config_useragent;
        var range = process.env.npm_package_config_p12_range;

        if (process.env.npm_package_config_p12_proto === "https"){
            request = https;
        }else{
            request = http;
        }

        var startd = moment().subtract(1, 'days').format("YYYY-MM-DD");
        var stopd =  moment().add(range, 'days').format("YYYY-MM-DD");
      
        var url = `http://www.zdf.de/api/v2/epg?station=zdf&startDate=${startd}&endDate=${stopd}&maxHits=2000`;
        
        getXmlStream(url);

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