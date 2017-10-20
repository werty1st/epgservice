// @flow
/* global process  */

(function (){
'use strict';

const moment = require("moment");
const https = require("https");
const flow  = require("xml-flow");

const log = require('../log.js'); 

const OpenReqCounter = require("./OpenReqCounter");



function SenderWeb(db, sportfilter){

    // protoype
    const openReqCounter = new OpenReqCounter("web");

    let delta = 0;
    const agent = process.env.npm_package_config_useragent;        

    this.openreq = function (){
        return openReqCounter.opened;
    };


    /**
     * addSendetermin creates a new Sendung Object and assigns data from xml object
     * after that it collects the Sendungs Preview Image
     */
    function addSendetermin (xmlElement){
       
        const sendung = {};
        
        sendung._id             = xmlElement.$attrs["ecms-id"]; //doc id
        sendung.id              = xmlElement.$attrs["ecms-id"]; //doc id
        sendung.rscId           = (xmlElement["rsc-id"] === undefined)?"0":xmlElement["rsc-id"]; //doc id
        //sendung.ecmsId           = xmlElement.$attrs["ecms-id"];
        sendung.vcmsChannelId    = xmlElement.$attrs["vcms-channel-id"];
        sendung.channelId        = xmlElement.channel;    
        sendung.text             = (xmlElement.copy === undefined)?"":xmlElement.copy;
        sendung.vcmsId           = xmlElement.$attrs["vcms-id"] || "0"; //bei ARD immer 0
        sendung.station          = (sendung.vcmsId == "0")?"ard":"olympia" + xmlElement.channel;   
        sendung.sportId          = xmlElement["sport-id"];
        sendung.sportName        = (xmlElement["sport-name"] === undefined || xmlElement["sport-name"] === "unknown" )?"":xmlElement["sport-name"];
        sendung.version          = process.env.npm_package_config_version;
        
        sendung.titel            = xmlElement.title;
        sendung.moderator        = (xmlElement.moderator === undefined)?"":xmlElement.moderator;
        sendung.start            = xmlElement.start;
        sendung.end              = xmlElement.end;


        //RSC FIX
        if (process.env.npm_package_config_ecms_rscFix === "true"){
            if (xmlElement["info"] !== undefined){
                sendung.rscId = xmlElement["info"];
            }
        }

        
        if (xmlElement['$name'] === 'bracket'){
            let event = xmlElement.event[0];
            sendung.rscId     = event["rsc-id"];
            sendung.sportId   = event["sport-id"];
            sendung.sportName = event["sport-name"];

            //RSC FIX
            if (process.env.npm_package_config_ecms_rscFix === "true"){
                if (event["info"] !== undefined){
                    sendung.rscId = event["info"];
                }
            }
        }

        if ((sendung.station != "ard") && (sendung.rscId != "0")){
            sportfilter.checkSport(sendung);
        }
        
        // if (sendung.vcmsId == 0){
        //     //ARD wird nur für google benötigt und hat kein bild
        // } else if (sendung.vcmsId == 10){
        //     //ZDF kommt hier nie vor
        // } else {
        // }
        sendung.externalImageUrl = (sendung.vcmsId == "0")?"":`http://www.zdf.de/ZDFmediathek/contentblob/${sendung.vcmsChannelId}/timg946x532blob`;


        /**
         * add delta to get current sendungen
         */        
        if (process.env.npm_package_config_ecms_delta === "true"){
            sendung.start = moment(sendung.start).add(delta, 'days').format(); 
            sendung.end   = moment(sendung.end  ).add(delta, 'days').format();
        }
        
        // store sendung to db
        db.save(sendung, (err) => {
            // Sendung sent to DB callback
            if (err){
                log.error("Error saving Sendung: ", err);
            }                
            // store to db complete
            log.debug(`item ${sendung._id} saved`);
            
            //log.debug("close",sendung._id,"-",sendung.titel);
            openReqCounter.emit('close');
        });

    }


    //xml stream reader
    /**
     * @param {stream} stream from http get 
     */
    function parseXmlStream(xmlstream){
        
        /**
         * passElementFn is passed to the xml parser
         * it receives a xml video/bracket element and stores it to its corresponding 
         * channel (web[web1-6, p12[Hauptprogramm])
         * at this time it is possible to reduce 
         */
        function passElementFn( video ) {

            //get channel
            let channel = video.channel;

            //drop channel <> 0-6 //0= ard 1-6 = websender 10=zdf=>drop
            switch (channel) {
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                    openReqCounter.emit("open");
                    addSendetermin(video);
                    break;
                default:
            }
        }

        let xml = flow(xmlstream, {strict:true});
         
        xml.on('tag:video', passElementFn); 
        xml.on('tag:bracket', passElementFn); 

    }

    //xml download
    /**
     * @param {string} url download xml
     * @param {function} callback to require('async') to continue with next url
     * passes xml stream to parseXmlStream
     */
    function getXmlStream(url, callback){
       
        log.verb("Download:",url);

        const get_options = require('url').parse(url);
        get_options.headers = {
                'User-Agent': agent,
                'Cache-Control': 'no-cache'
            };
        get_options.timeout = 2000;
        get_options.followRedirect = true;
        get_options.maxRedirects = 10;            

        https.get(get_options, (responeStream) => {

            if (responeStream.statusCode != 200){
                log.error(`Got invalid response: ${responeStream.statusCode} from ${url}`);
                setTimeout(()=>{ throw new Error(`Got invalid response: ${responeStream.statusCode} from ${url}`); });     
            } else {
                //send to xml stream reader
                parseXmlStream(responeStream);
                callback(null);
            }

        }).on('error', (e) => {
            log.error(`Got error: ${e.message}`);
            setTimeout(()=>{ throw new Error(`Got error: ${e.message}`); });
        });
    }



    /**
     * Genrate URLs based on DateTime.now() from Today-1 to Today+30 
     * @param {function} callback to call after all downloads have finished
     */
    this.update = function update(done){
      

        done();
        log.error("remove me sender web update()");
        return;
        

        log.info("web start");
        openReqCounter.lastPage = true; //no need to track pagination here
        openReqCounter.on('empty', ()=>{
            done();
        });

        if (process.env.npm_package_config_ecms_rscFix === "true"){
                log.setting("rscFix enabled");
        }                
                
        /**
         * delta berechnen und dann allen datumsanagben draufrechnen
         * heute - 2014-02-12 = x days
         */
        
        if (process.env.npm_package_config_ecms_delta === "true"){
            delta = moment().diff(moment( process.env.npm_package_config_ecms_startdate ), "days") ;
            log.setting("ECMS delta:",delta);
        } else {
            log.setting("ECMS delta disabled");
        }

        // create ECMS URLs based on Event Data
        const ecms_urls = urlgen({ startdate: process.env.npm_package_config_ecms_startdate,
                                            enddate: process.env.npm_package_config_ecms_enddate,
                                            options: { proto: process.env.npm_package_config_ecms_proto,
                                                        host : process.env.npm_package_config_ecms_host,
                                                        path : process.env.npm_package_config_ecms_path }
        });

        const threads = 3;
        require('async').eachLimit(ecms_urls, threads, function(url, next){
            getXmlStream(url, next);
        }, function(){
            log.info('SenderWeb','finished xml download');
        });                                                          


    };

}

function urlgen (data){ 

    const options = data.options;
    const startd = moment(data.startdate);
    const stopd = moment(data.enddate);
    const days = moment.duration(stopd.diff(startd)).asDays()+1; //plus heute
    const date = startd.clone();
    const urls = []; // [ uri:{ date , url} ]

    for (let i=0;i<days;i++){
        //url
        let filename = date.format("YYYY-MM-DD");
        let dpath = options.proto + "://" + options.host + options.path + filename +".xml";
        urls.push(dpath);
        date.add(1,"days");
    }
    return  urls;
}


module.exports = SenderWeb;

}());