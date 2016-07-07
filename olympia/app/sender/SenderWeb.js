(function (){
'use strict';

const moment = require("moment");
const https = require("https");
const flow  = require("xml-flow");

const OpenReqCounter = require("./OpenReqCounter");



function SenderWeb(db){

    // protoype
    const openReqCounter = new OpenReqCounter("web");

    let delta = 0;
    const agent = process.env.npm_package_config_useragent;        


    /**
     * addSendetermin creates a new Sendung Object and assigns data from xml object
     * after that it collects the Sendungs Preview Image
     * the done callback is passed from main.js@readXMLstream and gets passed to 
     */
    function addSendetermin (xmlElement, done){
       
        const sendung = {};
        
        sendung._id             = xmlElement.$attrs["ecms-id"]; //doc id
        sendung.id              = xmlElement.$attrs["ecms-id"]; //doc id
        sendung.rscId           = xmlElement["rsc-id"]; //doc id
        //sendung.ecmsId           = xmlElement.$attrs["ecms-id"];
        sendung.vcmsChannelId    = xmlElement.$attrs["vcms-channel-id"];
        sendung.channelId        = xmlElement.channel;    
        sendung.text             = (xmlElement.copy === undefined)?"":xmlElement.copy;
        sendung.vcmsId           = xmlElement.$attrs["vcms-id"] || "0"; //bei ARD immer 0
        sendung.station          = (sendung.vcmsId === "0")?"ard":"olympia" + xmlElement.channel;   
        sendung.sportId          = xmlElement["sport-id"];
        sendung.sportName        = xmlElement["sport-name"];
        sendung.version          = process.env.npm_package_config_version;
        
        sendung.titel            = xmlElement.title;
        sendung.moderator        = xmlElement.moderator;
        sendung.start            = xmlElement.start;
        sendung.end              = xmlElement.end;
        
        
        if (xmlElement['$name'] === 'bracket'){
            let event = xmlElement.event[0];
            sendung.rscId   = event["rsc-id"];
            sendung.sportId = event["sport-id"];
        }
        //console.log(xmlElement);
        //console.log(sendung);
        
        sendung.externalImageUrl = (sendung.vcmsId === 0)?"":`http://www.zdf.de/ZDFmediathek/contentblob/${sendung.vcmsChannelId}/timg946x532blob`;


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
            
            done(sendung);
        });

    }


    //xml stream reader
    /**
     * @param {stream} stream from http get 
     */
    function parseXmlStream(xmlstream){
        
        // callback func used in for loop
        function addSendeterminDone(sendung){
            //log.debug("close",sendung._id,"-",sendung.titel);
            openReqCounter.emit('close');
        }        


        /**
         * passElementFn is passed to the xml parser
         * it receives a xml video/bracket element and stores it to its corresponding 
         * channel (web[web1-6, p12[Hauptprogramm])
         * at this time it is possible to reduce 
         */
        function passElementFn( video ) {

            //get channel
            let channel = video.channel;

            //drop channel <> 0-6 //0= ard 1-6 = websender
            switch (channel) {
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                    openReqCounter.emit("open");
                    addSendetermin(video, addSendeterminDone);
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
     */
    function getXmlStream(url, callback){
        
        //url = "http://wmaiz-v-sofa02.dbc.zdf.de:7788/2014-02-06.xml";
        
        log.info("Download:",url);

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
                callback(`Got invalid response: ${responeStream.statusCode} from ${url}`);
                log.error(`Got invalid response: ${responeStream.statusCode} from ${url}`);
            } else {
                
                if (responeStream.headers['content-length'] === 0){
                    callback(`Got emtpy response from ${url}`,responeStream.headers);
                    log.error(`Got emtpy response from ${url}`,responeStream.headers);
                    return;
                }else {                
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

        log.info("web start");
        openReqCounter.lastPage = true; //no need to track pagination here
        openReqCounter.on('empty', ()=>{
            done();
        });
                
                
        /**
         * delta berechnen und dann allen datumsanagben draufrechnen
         * heute - 2014-02-12 = x days
         */
        if (process.env.npm_package_config_ecms_delta === "true"){
            delta = moment().diff(moment("2016-08-06"), "days") ;
            log.debug("Delta:",delta);
            log.info("Database:",process.env.DB);
        } else {
            log.info("Delta disabled");
        }

        // create ECMS URLs based on Event Data
        const ecms_urls = urlgen({ startdate: process.env.npm_package_config_ecms_startdate,
                                            enddate: process.env.npm_package_config_ecms_enddate,
                                            options: { proto: process.env.npm_package_config_ecms_proto,
                                                        host : process.env.npm_package_config_ecms_host,
                                                        path : process.env.npm_package_config_ecms_path } });

    
        const threads = 2;
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