(function (){
'use strict';

var moment = require("moment");
var https = require("https");
var flow  = require("xml-flow");
const EventEmitter = require('events');



class OpenReqCounter extends EventEmitter {

    constructor(next){
        super();
        
        this.opened = 0;
        this.last_page = true; // not require here
        this.next = next;

        this.on('open', () => {
            this.opened++;
            //log.error("open:",opened);
        });
    
        this.on('close', () => {
            this.opened--; 
            if(this.opened===0)
                this.emit('empty');
        });    
    
        this.on('empty', () => {
            if (this.last_page){
                if (this.next) this.next();
            }
            log.debug("all requests finished");
        });        
    }
}

function SenderWeb(db){

    // protoype
    var openReqCounter = null;

    var delta = 0;
    var senderO = this;
    var agent;


        


    /**
     * addSendetermin creates a new Sendung Object and assigns data from xml object
     * after that it collects the Sendungs Preview Image
     * the done callback is passed from main.js@readXMLstream and gets passed to 
     */
    function addSendetermin (xmlElement, done){
       
        var sendung = {};
        
        sendung.ecmsid           = xmlElement.$attrs["ecms-id"];
        sendung.vcmsid           = xmlElement.$attrs["vcms-id"];
        sendung._id              = xmlElement.$attrs["vcms-id"]; //doc id
        sendung.vcmsChannelId    = xmlElement.$attrs["vcms-channel-id"];
        //sendung.typicalId        = xmlElement.$attrs["typical-id"];
        sendung.titel            = xmlElement.title;
        sendung.moderator        = xmlElement.moderator;
        sendung.text             = xmlElement.copy;
        sendung.start            = xmlElement.start;
        sendung.end              = xmlElement.end;
        sendung.station          = "olympia" + xmlElement.channel;
        
        //sendung.externalImageUrl = `http://www.zdf.de/ZDFmediathek/contentblob/${sendung.vcmsid}/timg485x273blob`;
        sendung.externalImageUrl = `http://www.zdf.de/ZDFmediathek/contentblob/${sendung.vcmsid}/timg672x378blob`;

        sendung.version = process.env.npm_package_config_version;

        /**
         * TODO: remove
         * add delta to get current sendungen
         */        
        // sendung.start = moment(sendung.start).add(delta, 'days').format(); 
        // sendung.end   = moment(sendung.end  ).add(delta, 'days').format();

        // store sendung to db
        db.save(sendung, (err) => {
            // Sendung sent to DB callback
            if (err){
                log.error("Error saving Sendung: ", err);
            }                
            // store to db complete
            log.debug(`id ${sendung._id} saved`);
            
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
            log.debug("close",sendung.start,"-",sendung.titel);
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

            //drop channel <> 1-6
            switch (channel) {
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
    
    // var stream = require('stream');
    // class EchoStream extends stream.Writable {
    //     _write(chunk, enc, next) {
    //         console.log(chunk.toString());
    //         next();
    //     }
    // }
    // const echoStream = new EchoStream();
    
    //xml download
    /**
     * @param {string} url download xml  
     */
    function getXmlStream(url, callback){
        
        //url = "http://wmaiz-v-sofa02.dbc.zdf.de:7788/2014-02-06.xml";
        
        log.info("Download:",url);

        var get_options = require('url').parse(url);
        get_options.headers = {
                'User-Agent': agent,
                'Cache-Control': 'no-cache'
            };

        https.get(get_options, (responeStream) => {

            if (responeStream.statusCode != 200){
                log.error(`Got invalid response: ${responeStream.statusCode} from ${url}`);
                callback(`Got invalid response: ${responeStream.statusCode} from ${url}`);
            } else {
                
                if (responeStream.headers['content-length'] == 0){
                    log.error(`Got emtpy response from ${url}`,responeStream.headers);
                    callback(`Got emtpy response from ${url}`,responeStream.headers);
                    return;
                }else {                
                    //send to xml stream reader
                    parseXmlStream(responeStream);
                    callback(null);
                }   
            }

        }).on('error', (e) => {
            log.error(`Got error: ${e.message}`);
            callback(`Got error: ${e.message}`);
        });
    }



    /**
     * Genrate URLs based on DateTime.now() from Today-1 to Today+30 
     * 
     */
    this.update = function update(done){

        openReqCounter = new OpenReqCounter(done);
        
        openReqCounter.on('empty', ()=>{
            db.removeOutdated();
        });
        
        agent = process.env.npm_package_config_useragent;
        
        /**
         * delta berechnen und dann allen datumsanagben draufrechnen
         * heute - 2014-02-12 = x days
         */
        if (process.env.npm_package_config_ecms_delta){
            delta = moment().diff(moment("2014-02-06"), "days") ;
            log.debug("Delta:",delta);
            log.info("Database:",process.env.DB);
        }

        // create ECMS URLs based on Event Data
        var ecms_urls = urlgen({ startdate: process.env.npm_package_config_ecms_startdate,
                                            enddate: process.env.npm_package_config_ecms_enddate,
                                            options: { proto: process.env.npm_package_config_ecms_proto,
                                                        host : process.env.npm_package_config_ecms_host,
                                                        path : process.env.npm_package_config_ecms_path } });

    
        var threads = 1;
        require('async').eachLimit(ecms_urls, threads, function(url, next){
            getXmlStream(url, next);
        }, function(){
            log.info('SenderWeb','finished xml download');
        });                                                          


    };

}

function urlgen (data){ 

    var options = data.options;
   
    var startd = moment(data.startdate);
    var stopd = moment(data.enddate);
    var days = 0;
    var urls = []; // [ uri:{ date , url} ]



    days = moment.duration(stopd.diff(startd)).asDays()+1; //plus heute
    var date = startd.clone();

    for (var i=0;i<days;i++){
        //url
        var filename = date.format("YYYY-MM-DD");
        var dpath = options.proto + "://" + options.host + options.path + filename +".xml";
        urls.push(dpath);
        date.add(1,"days");
    }

    return  urls;
}


module.exports = SenderWeb;

}());