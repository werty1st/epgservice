(function (){
'use strict';

const flow  = require("xml-flow");
const moment  = require("moment");
const async = require("async");

const OpenReqCounter = require("./OpenReqCounter");


function SenderZDF(db){

    const agent = process.env.npm_package_config_useragent;
    const openReqCounter = new OpenReqCounter("zdf");
    const request = (process.env.npm_package_config_p12_proto === "https")? require("https") : require("http");

     /**
     * addVideo creates a new Sendung Object and assigns data from xml object
     * after that it collects the Sendungs Preview Image
     * the done callback is passed from main.js@readXMLstream and gets passed to 
     */
    function addSendetermin (sendung, done){
        
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
    

        //log.debug("sendung.beitragReference",sendung.beitragReference);

        //get url
        const get_options = require('url').parse(sendung.beitragReference);
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
                            if( elm.Link.search("layout=946x532") >-1 ){
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
        
        let lastPage = false;
        let xml = flow(stream, {strict:true});

        // callback func used in for loop completes after getDetails
        function addSendeterminDone(sendung){
            
            return function(){
                log.debug("close",sendung.start,"-",sendung.titel);
                openReqCounter.emit('close');
            };
        }
        
        // get Navigation Links
        xml.on('tag:nextPageLink', (elm) => {
                if (elm.Link){
                    getXmlStream(elm.Link);
                } else {
                    lastPage = true;
                }
        });         

        xml.on('tag:Sendetermin', (sendetermin) => {

            let titel = sendetermin.titel.toLowerCase();
            /*if ((titel.search("uefa") > -1) ||
                (titel.search("fifa") > -1) ||
                (titel.search("sport") > -1) ||
                (titel.search("heute") > -1) ||
                (titel.search("fußball") > -1) ||
                (titel.search("leichtathletik") > -1) ||
                (titel.search("olympia") > -1)) */{
                    
                    let sendung = {};
                    
                    //sendung.externalId = sendetermin.$attrs.externalId;
                    sendung.id = sendetermin.$attrs.externalId;
                    sendung.text = sendetermin.text;
                    sendung.station = sendetermin.sender.titel.toLowerCase();
                    sendung.titel = sendetermin.titel;
                    sendung.start = sendetermin.beginnDatum;
                    sendung.end = sendetermin.endeDatum;
                    sendung.beitragReference = sendetermin.epgBeitrag.ref;
                    
                    openReqCounter.emit("open");
                    //console.log("open request: details, lastPage:",openReqCounter.lastPage);
                    getSendungsDetails(sendung, addSendeterminDone(sendung));
                }
        });        

        xml.on('end', () => {
               if (lastPage) openReqCounter.lastPage = true;
        });  

    }
    
    //xml download
    /**
     * @param {string} url download xml  
     * passes xml stream to parseXmlStream
     */
    function getXmlStream(url, callback){

        log.info("Download:",url);
        
        // set dummy for following requests
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
                callback(`Got invalid response: ${responeStream.statusCode} from ${url}`);
                log.error(`Got invalid response: ${responeStream.statusCode} from ${url}`);
                return;
            } else {
                
                if (responeStream.headers['content-length'] === 0){
                    callback(`Got emtpy response from ${url}`,responeStream.headers);
                    log.error(`Got emtpy response from ${url}`,responeStream.headers);
                    return;
                } else {
                    //send to xml stream reader                   
                    parseXmlStream(responeStream);
                    callback(null);
                }
            }
        }).on('error', (e) => {
            callback(`Got error: ${e.message}`);
            log.error(`Got error: ${e.message}`);
        });
    }

    /**
     * Genrate URLs based on DateTime.now() from Today-1 to Today+30 
     * 
     */
    this.update = function update(done){

        log.info("zdf start");
        openReqCounter.on('empty', ()=>{
            done();
        });
                
        
        // how many days should i get
        const range = process.env.npm_package_config_p12_range;
        const startd = moment().subtract(1, 'days').format("YYYY-MM-DD");
        const stopd =  moment().add(range, 'days').format("YYYY-MM-DD");
      
        const urls = [
            `http://www.zdf.de/api/v2/epg?station=zdf&startDate=${startd}&endDate=${stopd}&maxHits=2000`
          /*`http://www.zdf.de/api/v2/epg?station=zdfinfo&startDate=${startd}&endDate=${stopd}&maxHits=2000`,
            `http://www.zdf.de/api/v2/epg?station=zdfneo&startDate=${startd}&endDate=${stopd}&maxHits=2000`,
            `http://www.zdf.de/api/v2/epg?station=arte&startDate=${startd}&endDate=${stopd}&maxHits=2000`,
            `http://www.zdf.de/api/v2/epg?station=3sat&startDate=${startd}&endDate=${stopd}&maxHits=2000`,
            `http://www.zdf.de/api/v2/epg?station=zdf.kultur&startDate=${startd}&endDate=${stopd}&maxHits=2000`,
            `http://www.zdf.de/api/v2/epg?station=phoenix&startDate=${startd}&endDate=${stopd}&maxHits=2000`*/
        ];

        // zdf zdfinfo zdfneo arte 3sat zdf.kultur phoenix ki.ka
        
        const threads = 2;
        require('async').eachLimit(urls, threads, function(url, next){
            getXmlStream(url, next);
        }, function(){
            log.info('SenderZDF','finished xml download');
        });

    };
        
}

module.exports = SenderZDF;

}());
