// @flow
/* global process */

(function (){
'use strict';

const flow  = require("xml-flow");
const moment = require('moment-timezone');

const async = require('async');
const log = require('../log.js'); 

const request = require("request-promise-native");
const OpenReqCounter = require("./OpenReqCounter");

const API_HOST = process.env.apihost;
const brands = require('./../../package.json').config.api.brands;
// event dauer in tagen
const range = 7;//process.env.npm_package_config_api_range*1;


const concatArraysUniqueWithSort = function (thisArray, otherArray) {
    let newArray = thisArray.concat(otherArray).sort(function (a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
    });

    return newArray.filter(function (item, index) {
        return newArray.indexOf(item) === index;
    });
};

function SenderZDF(db, zdfapi){

    const agent = process.env.npm_package_config_useragent;    
    const openReqCounter = new OpenReqCounter("zdf");
        

    // function openreq (){
    //     return openReqCounter.opened;
    // };

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


    /**
     * GET /cmdm/epg/broadcasts/{posId}
    {
        "_id": "2813",
        "_rev": "5-afc076579c67ab1779ba3884caf95c83",
        "id": "2813",
        "rscId": "WRM297501",
        "vcmsChannelId": "2686294",
        "channelId": "1",
        "text": "Im Freistilringen der Männer werden im Leichtgewicht und im Schwergewicht die Medaillen vergeben. Beim Freistil gilt der gesamte Körper von Kopf bis Fuß als Angriffsfläche.",
        "vcmsId": "2818522",
        "station": "olympia1",
        "sportId": "16268_MALE",
        "sportName": "Ringen",
        "version": "1",
        "titel": "(M) Ringen Freistil Qualifikation",
        "moderator": "",
        "start": "2016-08-21T15:05:00+02:00",
        "end": "2016-08-21T16:20:00+02:00",
        "externalImageUrl": "http://www.zdf.de/ZDFmediathek/contentblob/2686294/timg946x532blob"
    }
     * 
     */

    async function downloadDetails(posId){
        
            const token = await zdfapi.token;
        
            //let url = `https://${API_HOST}/cmdm/epg/broadcasts/${posId}?profile=default`;
            let url = `https://${API_HOST}/cmdm/epg/programme-items/POS_${posId}?profile=default`;
             
            log.debug("url",url);
            
            let result = await request({
                url: url,
                method: 'GET',
                headers: {
                    'User-Agent': process.env.npm_package_config_useragent,
                    'Api-Auth': `bearer ${token.access_token}`,
                    'Accept': "application/vnd.de.zdf.v1.0+json;charset=utf-8"
                },
                json: true
            });
        
            console.log(result);    
        
            return result;
    }    


    //get all sport event ids
    async function getEPG(url){
        
        const token = await zdfapi.token;
        let response = false;

        //console.log("url",url);
        
        let result = await request({
            url: url,
            method: 'GET',
            headers: {
                'User-Agent': process.env.npm_package_config_useragent,
                'Api-Auth': `bearer ${token.access_token}`,
                'Accept': "application/vnd.de.zdf.v1.0+json;charset=utf-8"
            }
        });
    
        
        try {
            response = JSON.parse(result);
        } catch (error) {
            //todo send mail
        }
        
        return response["http://zdf.de/rels/cmdm/broadcasts"].map(item=>item.posId);        
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


    function generateURLs(){

        let delta = 0;
        
        /**
         * delta berechnen und dann allen datumsanagben draufrechnen
         * heute - 2014-02-12 = x days
         */
        if (process.env.npm_package_config_api_delta === "true"){
            delta = moment( process.env.npm_package_config_api_startdate ).diff(moment(), "days")*1 + 1;
            log.setting("api delta:",delta);
        } else {
            log.setting("api delta disabled");
        }                
        
        //prepare brands
        const brandlist = brands.map((brand)=>brand.brandid).join(",");        

        //generate urls
        const urls = [];
        for (let i=0;i<range;i++){
            let startd = moment().add(delta - 1 + i, 'days').tz("Europe/Berlin").format();
            let stopd  = moment().add(delta + i, 'days').tz("Europe/Berlin").format();

            startd = encodeURIComponent(startd);
            stopd  = encodeURIComponent(stopd);

            let url = `https://${API_HOST}/cmdm/epg/broadcasts?from=${startd}&to=${stopd}&brands=${brandlist}&tvServices=ZDF&limit=6&page=1&order=asc&onlyCompleteBroadcasts=false&profile=teaser`;
            urls.push(url);
        }        

        return urls;
    }


    async function getPOSitemList(urls){
        return new Promise( (resolve, reject)=>{

            const threads = 2;
            let allPosIDs = [];            

            async.eachLimit(urls, threads, async (url, next) => {
                
                let items = await getEPG(url);
                allPosIDs = concatArraysUniqueWithSort(allPosIDs, items);
                next();
    
            }, function(){
                log.info('SenderZDF','finished xml download');
                resolve(allPosIDs);
            });

        });
    }

    /**
     * Genrate URLs and init download 
     * @param {function} callback to call after all downloads have finished
     */
    this.update = async function update(done){


        log.info("zdf start");
        openReqCounter.on('empty', ()=>{
            done();
        });
                

        const urls = generateURLs();
        const allPosIDs = await getPOSitemList(urls);

        let result = await downloadDetails(allPosIDs[0]);
        console.log(result);


        done();

    };
        
}

module.exports = SenderZDF;

}());
