// @flow
/* global process */

(function (){
'use strict';

const flow  = require("xml-flow");
const moment = require('moment-timezone');
const jp = require('jsonpath');

const async = require('async');
const log = require('../log.js'); 

const request = require("request-promise-native");
const OpenReqCounter = require("./OpenReqCounter");

const API_HOST = process.env.apihost;
const brands = require('./../../package.json').config.api.brands;

const AGENT = process.env.npm_package_config_useragent;
const STARTDATE = process.env.npm_package_config_api_startdate;
const DELTA = process.env.npm_package_config_api_delta;
const VERSION = process.env.npm_package_config_version;

// event dauer in tagen
const RANGE = process.env.npm_package_config_api_range*1;



function SenderZDF(db, zdfapi){


    // save sendung to db
    async function saveSendungen(sendungen){
        
        //return array of promises
        let results = sendungen.map( (sendung)=>{
            //return promise for each element to store
            return new Promise( (resolve, reject)=>{                
                db.save(sendung, (err)=>{
                    if (err){
                        reject(err);
                    }                
                    resolve();              
                });
            });
        });
        return Promise.all(results);

    }
   


   
    /**
     * downloads details of each entry in the list
     */
    async function getDetailsList(POSitems){
        return new Promise( (resolve, reject)=>{
            
            const threads = 4;
            let results = [];            

            async.eachLimit(POSitems, threads, async (POSitem, next) => {
                
                let epgdoc = await downloadDetails(POSitem);
                results.push(epgdoc);
                next();
    
            }, ()=>{
                resolve(results);
            });
        });
    }

    /**
     * download details of POS item and return new Object based on the details
     */
    async function downloadDetails( posItem ) {
    
        let url = `https://${API_HOST}/cmdm/epg/programme-items/POS_${posItem.posId}?profile=default`;
            
        log.debug("url",url);
        
        let result = await downloadUrl(url);
   
        let moderator = jp.query(result, '$.crewDetails.crewDetail[*]')
                            .filter( (item)=>(item.function == "moderation")).pop();

        let image = jp.query(result, '$.images.image[*]').pop();
                            //.filter( (item)=>(item.function == "moderation")).pop();
                                    
        let epgItem = {};
        //epgItem.id        = posItem.posId;
        epgItem._id        = posItem.posId;
        epgItem.rscId     = "undefined";
        epgItem.channelId = 1;
        epgItem.text      = (result.text)?result.text:""; //with html tags
        epgItem.station   = "ZDF";
        epgItem.sportId   = "undefined";
        epgItem.sportName = "undefined";
        epgItem.version   = VERSION;
        epgItem.titel     = result.title;
        epgItem.moderator = (moderator && moderator.name)?moderator.name:"";
        epgItem.start     = posItem.airtimeBegin;
        epgItem.end       = posItem.airtimeEnd;
        epgItem.imageId   = image && image.id;


        /**
         * add delta to get current sendungen
         */        
        if (DELTA === "true"){
            let delta = moment().diff(moment( STARTDATE ), "days") ;
            epgItem.start = moment(epgItem.start).add(delta, 'days').format(); 
            epgItem.end   = moment(epgItem.end  ).add(delta, 'days').format();
        }        
    
        return epgItem;
    }    


    /**
     * generate one EPG search URL from Start to End date
     */
    function generateURL(){

        let delta = 0;
        
        /**
         * delta berechnen und dann allen datumsanagben draufrechnen
         * heute - 2014-02-12 = x days
         */
        if (DELTA === "true"){
            delta = moment( STARTDATE ).diff(moment(), "days")*1 + 1;
            log.setting("api delta:",delta);
        } else {
            log.setting("api delta disabled");
        }                
        
        //prepare brands
        const brandlist = brands.map((brand)=>brand.brandid).join(",");        

        //generate url
        let startd = moment().add(delta - 1, 'days').tz("Europe/Berlin").format();
        let stopd  = moment().add(delta + RANGE, 'days').tz("Europe/Berlin").format();

        startd = encodeURIComponent(startd);
        stopd  = encodeURIComponent(stopd);

        let url = `https://${API_HOST}/cmdm/epg/broadcasts?from=${startd}&to=${stopd}&brands=${brandlist}&tvServices=ZDF&limit=2&page=1&order=asc&onlyCompleteBroadcasts=false&profile=teaser`;

        return url;
    }


    /**
     * recursive function to download paginated results from the search request
     * returns an array of search results
     */
    async function downloadSearchResult(url){
        
        let page = await downloadUrl(url);
        if (page["next-archive"]){
            return (await downloadSearchResult("https://"+API_HOST+page["next-archive"])).concat(page);
        } else {
            return Array(page);
        }        
    }


    /**
     * generic download function returns JSON
     */
    async function downloadUrl(url){
        
        const token = await zdfapi.token;
        
        return request({
            url: url,
            method: 'GET',
            headers: {
                'User-Agent': AGENT,
                'Api-Auth': `bearer ${token.access_token}`,
                'Accept': "application/vnd.de.zdf.v1.0+json;charset=utf-8"
            },
            json: true
        });

    }


    /**
     * Genrate URLs and init download 
     * @param {function} callback to call after all downloads have finished
     */
    this.update = async function update(done){


        log.info("zdf start");

                

        const url = generateURL();
        const epgResults = await downloadSearchResult(url); //return array of epg results

        //reduce arrays of epg results to one array of epg results
        const broadcasts = epgResults.reduce( (PosItems, epgresult) =>{
            return PosItems.concat( epgresult["http://zdf.de/rels/cmdm/broadcasts"] );
        },[])

        log.info(`got ${broadcasts.length} EPG entries from ${epgResults.length} pages`);

        let sendungen = await getDetailsList(broadcasts);
        
        let savedItems = await saveSendungen(sendungen);
        
        done();
        //savedItems.forEach(x=>log.debug(x));

    };
        
}

module.exports = SenderZDF;

}());
