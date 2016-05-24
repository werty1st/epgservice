(function (){
'use strict';

var flow  = require("xml-flow");
var moment  = require("moment");
var async = require("async");
var http  = require("http");
var https  = require("https");
var xpathStream = require('xpath-stream');
var _ = require('underscore');

const OpenReqCounter = require("./OpenReqCounter");


function SenderZDF(db){

    var senderO = this;
    var agent;
    var request;
    
    var openReqCounter = null;
    

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
        sendung.text            = (sendung.text === undefined)?"" : sendung.text; //bei Wiederholungen leer
        sendung._id             = sendung.externalId;                        
                        
                
        delete sendung.beitragReference;    
        delete sendung.visualFamilyReference;    
    
                
        // save sendung to db
        db.save(sendung, (err)=>{
            if (err){
                log.error("Error saving Sendung: ", err);
            }                
            // save to db complete
            done();
            log.debug(`id ${sendung._id} saved.`);                
        });
        
    }


    // get Sendungs Details from Beitrag
    function getSendungsDetails(sendung, callback){
    
        //get url
        var get_options = require('url').parse(sendung.beitragReference);
            get_options.headers = {'User-Agent': agent};
            get_options.timeout = 2000;
            get_options.followRedirect = true;
            get_options.maxRedirects = 10;

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


                let xml = flow(responeStream, {strict:true});
                
                xml.on('tag:image', (elm) => {
                        if (sendung.externalImageUrl !== ""){
                            if( elm.Link.search("layout=672x378") >-1 ){
                                //console.log("img found");
                                sendung.externalImageUrl = elm.Link;
                            }
                        }
                }); 

                xml.on('tag:CrewDetail', (elm) => {
                        if (sendung.moderator !== ""){
                            if (elm.funktion === "moderation"){
                                sendung.moderator = elm.name;
                            }
                        }
                }); 

                xml.on("end",()=>{
                    addSendetermin(sendung, callback);
                });

            }
        }).on('error', (e) => {
            log.error(`Error in response: from ${url}`);
            throw new Exception(e);
        });
    }

    //xml stream parser
    /**
     * @param {stream} stream from http get.
     * passes sendungen to addSendetermin
     */
    function parseXmlStream(stream){
        
        var has_data=false;

        // get Navigation Links
        stream
            .pipe(xpathStream("/EPG/navigation/Navigation/nextPageLink/Link/url/text()"))
            .on('data',(x)=>{
                has_data = true;
                var unescaped = _.unescape(x);
                // send url back to getXmlStream to find the next page
                getXmlStream(unescaped);
            })
            .on("end",()=>{
                if(!has_data){
                    openReqCounter.last_page = true;    
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
        // filter Sportdata
        stream
            .pipe(xpathStream("/EPG/treffer/Sendetermin",{
                externalId: "./@externalId",
                text: "text/text()",
                titel: "titel/text()",
                start: "beginnDatum/text()",
                end: "endeDatum/text()",
                beitragReference: "epgBeitrag/Beitrag_Reference/@ref",
                visualFamilyReference  : "bildfamilie/VisualFamily_Reference/@ref"            
            }))
            .on('data',(sendungen)=>{
                    
                    let sport = sendungen.filter(x=>{
                        let titel = x.titel.toLowerCase();
                        if ((titel.search("uefa") > -1) ||
                            (titel.search("fifa") > -1) ||
                            (titel.search("sport") > -1) ||
                            (titel.search("fußball") > -1) ||
                            (titel.search("leichtathletik") > -1) ||
                            (titel.search("olympia") > -1))
                            return true;
                    });

                    sport.map(sendung=>{
                        getSendungsDetails(sendung, addSendeterminDone(sendung));
                    });                        
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
            get_options.timeout = 2000;
            get_options.followRedirect = true;
            get_options.maxRedirects = 10;

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

        openReqCounter = new OpenReqCounter(done);
        openReqCounter.on('empty', ()=>{
            db.removeOutdated("zdf");
        });
                
        agent = process.env.npm_package_config_useragent;
        
        // how many days should i get
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

}());







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