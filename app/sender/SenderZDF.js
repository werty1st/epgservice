// @flow
/* global process */

(function (){
'use strict';

const flow  = require("xml-flow");
const moment  = require("moment");
const async = require('async');
const log = require('../log.js'); 

const request = require("https");

const zdfapi = require("./api.zdf.de/api")({ client: process.env.apiclient, secret: process.env.apisecret, apiint: process.env.apiint}); 




const OpenReqCounter = require("./OpenReqCounter");


function SenderZDF(db){

    const agent = process.env.npm_package_config_useragent;    
    const openReqCounter = new OpenReqCounter("zdf");
    

    // const apiRequest = request.defaults({
    //     headers: {
    //         'User-Agent': process.env.npm_package_config_useragent,
    //         'Api-Auth': `bearer ${zdfapi.token}`,
    //         'Accept': "application/vnd.de.zdf.v1.0+json;charset=utf-8"
    //     }
    // });
        

    this.openreq = function (){
        return openReqCounter.opened;
    };

     /**
     * addVideo creates a new Sendung Object and assigns data from xml object
     * after that it collects the Sendungs Preview Image
     */
    function addSendetermin (sendung){
        
        sendung._id             = sendung.id;                        
        //sendung.ecmsId          = "0";
        sendung.vcmsChannelId   = "74";
        sendung.channelId       = "10";                        
        sendung.text            = (sendung.text === undefined)?"" : sendung.text; //bei Wiederholungen leer
        sendung.vcmsid          = "1822600";
        //sendung.station         = "zdf";
        sendung.sportId          = "0";
        sendung.sportName        = "";
        sendung.version = process.env.npm_package_config_version;
        
        delete sendung.beitragReference;    
        delete sendung.visualFamilyReference;  
        

        // fix text linebreak
        sendung.text = sendung.text.replace(/\s\s/gm,"\r\n");

    
        // save sendung to db
        db.save(sendung, (err)=>{
            if (err){
                log.error("Error saving Sendung: ", err);
            }                
            // save to db complete
            //log.debug("close",sendung.start,"-",sendung.titel);
            openReqCounter.emit('close');
            log.debug(`id ${sendung._id} saved.`);                
        });
        
    }


    // get Sendungs Details from Beitrag
    function getSendungsDetails(sendung){

        //get url
        const get_options = require('url').parse(sendung.beitragReference);
        get_options.headers = {'User-Agent': agent};
        get_options.timeout = 2000;
        get_options.followRedirect = true;
        get_options.maxRedirects = 10;

        // default empty url
        sendung.externalImageUrl = "";

        request.get(get_options, (responeStream) => {

            if (responeStream.statusCode != 200){
                log.warn(`getSendungsDetails: Got invalid statusCode: ${responeStream.statusCode} from ${url}`);
                // alternativ break execution
                //setTimeout(()=>{ throw new Error(`getSendungsDetails: Got invalid statusCode: ${responeStream.statusCode} from ${url}`); });
                // add sendung without details
                addSendetermin(sendung);
            } else {

                let xml = flow(responeStream, {strict:true});
                xml.on('tag:image', (elm) => {
                    if( elm.Link.search("layout=946x532") >-1 ){
                        sendung.externalImageUrl = elm.Link;
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
                    addSendetermin(sendung);
                });

            }
        }).on('error', (e) => {
            log.error(`Error in response: from ${url}`);
            setTimeout(()=>{ throw e; });
        });
    }

    //xml stream parser
    /**
     * @param {stream} stream from http get.
     * passes sendungen to addSendetermin
     */
    function parseXmlStream(stream){
        
        let lastPage = false;
        let xml = flow(stream, {strict:true, normalize:false /* keep double spaces */});
        
        // get Navigation Links
        xml.on('tag:nextPageLink', (elm) => {
                if (elm.Link){
                    getXmlStream(elm.Link);
                } else {
                    lastPage = true;
                }
        });         

        // get sendung
        xml.on('tag:Sendetermin', (sendetermin) => {
            let titel = sendetermin.titel.toLowerCase();
            if ( titel.match(/(^|\s)olympia(\s|$)/gi) != null ) {
                    
                    let sendung = {};

                    //sendung.externalId = sendetermin.$attrs.externalId;
                    sendung.id = sendetermin.$attrs.externalId;
                    sendung.text = sendetermin.text;
                    sendung.station = sendetermin.sender.titel.toLowerCase();
                    sendung.titel = sendetermin.titel;
                    sendung.start = sendetermin.beginnDatum;
                    sendung.end = sendetermin.endeDatum;
                    sendung.beitragReference = sendetermin.epgBeitrag.ref;

                    // get preview image link and moderator
                    openReqCounter.emit("open");
                    getSendungsDetails(sendung);
                }
        });        

        // page end reached
        xml.on('end', () => {
               if (lastPage) openReqCounter.lastPage = true;
        });  

    }
    
    //xml download
    /**
     * @param {string} url download xml  
     * @param {function} callback to require('async') to continue with next url
     * passes xml stream to parseXmlStream
     */
    function getXmlStream(url, callback){

        log.verb("Download:",url);
        
        // set dummy for requests from parseXmlStream
        // to download subsequent pages
        if (!callback) callback=function(){};

        const get_options = require('url').parse(url);
        get_options.headers = {
                'User-Agent': agent,
                'Cache-Control': 'no-cache'
            };
        get_options.timeout = 2000;
        get_options.followRedirect = true;
        get_options.maxRedirects = 10;

        request.get(get_options, (responeStream) => {

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
     * Genrate URLs and init download 
     * @param {function} callback to call after all downloads have finished
     */
    this.update = function update(done){

        let delta = 0;

        log.info("zdf start");
        openReqCounter.on('empty', ()=>{
            done();
        });
                

        /**
         * delta berechnen und dann allen datumsanagben draufrechnen
         * heute - 2014-02-12 = x days
         */
        if (process.env.npm_package_config_p12_delta === "true"){
            delta = moment( process.env.npm_package_config_ecms_startdate ).diff(moment(), "days")*1 + 1;
            log.setting("P12 delta:",delta);
        } else {
            log.setting("P12 delta disabled");
        }                
        
        // how many days should i get
        const range = process.env.npm_package_config_p12_range*1;

        const startd = moment().add(delta - 1, 'days').format("YYYY-MM-DD");
        const stopd  = moment().add(delta + range, 'days').format("YYYY-MM-DD");
      
        const urls = [
        /*  `https://www.zdf.de/api/v2/epg?station=zdf&startDate=${startd}&endDate=${stopd}&maxHits=2000`
            `http://www.zdf.de/api/v2/epg?station=zdfinfo&startDate=${startd}&endDate=${stopd}&maxHits=2000`,
            `http://www.zdf.de/api/v2/epg?station=zdfneo&startDate=${startd}&endDate=${stopd}&maxHits=2000`,
            `http://www.zdf.de/api/v2/epg?station=arte&startDate=${startd}&endDate=${stopd}&maxHits=2000`,
            `http://www.zdf.de/api/v2/epg?station=3sat&startDate=${startd}&endDate=${stopd}&maxHits=2000`,
            `http://www.zdf.de/api/v2/epg?station=zdf.kultur&startDate=${startd}&endDate=${stopd}&maxHits=2000`,
            `http://www.zdf.de/api/v2/epg?station=phoenix&startDate=${startd}&endDate=${stopd}&maxHits=2000`*/
        ];

        // zdf zdfinfo zdfneo arte 3sat zdf.kultur phoenix ki.ka
        
        const threads = 2;
        async.eachLimit(urls, threads, function(url, next){
            getXmlStream(url, next);
        }, function(){
            log.info('SenderZDF','finished xml download');
        });

    };
        
}

module.exports = SenderZDF;

}());
