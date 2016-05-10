(function (){
'use strict';

var moment = require("moment");
var https = require("https");
var flow  = require("xml-flow");
var xpathStream = require('xpath-stream');
var stream = require('stream');
var request = require('request');
const EventEmitter = require('events');



class OpenReqCounter extends EventEmitter {

    constructor(next){
        super();
        
        this.opened = 0;
        this.last_page = false;
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
    function addSendetermin (sendung, done){

        /**
         * TODO: remove
         * add delta to get current sendungen
         */        
        sendung.start = moment(sendung.start).add(delta, 'days').format(); 
        sendung.end   = moment(sendung.end  ).add(delta, 'days').format();
        


        // store sendung to db
        db.store(sendung, (err)=>{
            if (err){
                log.error("Error saving Sendung: ", err);
            }                
            // store to db complete
            log.debug(`id ${sendung._id} saved`);
            done();
        });

    }


    //xml stream reader
    /**
     * @param {stream} stream from http get 
     */
    function parseXmlStream(){
        
        // callback func used in for loop
        function addSendeterminDone(sendung){
            
            return function(){
                log.debug("close",sendung.start,"-",sendung.titel);
                openReqCounter.emit('close');
            };
        }        
        
        return (xpathStream("/export/video",{
                ecmsid: "./@ecms-id",
                vcmsid: "./@vcms-id",
                _id: "./@vcms-id",
                vcmsChannelId: "./@vcms-channel-id",
                titel: "title/text()",
                moderator: "moderator/text()",
                text: "copy/text()",
                start: "start/text()",
                end: "end/text()",
                station: "channel/text()"
            }))
            .on('data',(result)=>{
                for(var i = 0; i< result.length; i++){
                    var sendung = result[i];
                        sendung.station          = "web" + sendung.station;
                        sendung.externalImageUrl = `http://www.zdf.de/ZDFmediathek/contentblob/${sendung.vcmsid}/timg672x378blob`;
                        
                        openReqCounter.emit("open");
                        addSendetermin(sendung, addSendeterminDone(sendung) );
                }
                
            });
    }

 
    
    //xml download
    /**
     * @param {string} url download xml  
     */
    function getXmlStream(url,retry){
        
        log.info("Download:",url);

        request
            .get({url:url, method: 'GET', headers: {'Content-Type': 'application/x-www-form-urlencoded','User-Agent': agent }})
            .on('response', function(response) {
                //console.log(response.statusCode); // 200 
                //console.log(response.headers['content-type']); 
                if (response.statusCode != 200){
                    log.error(`Got invalid response: ${response.statusCode} from ${url}`);
                    this.end();
                }
            })
            .pipe( parseXmlStream() );
    }



    /**
     * Genrate URLs based on DateTime.now() from Today-1 to Today+30 
     * 
     */
    this.update = function update(done){

        openReqCounter = new OpenReqCounter(done);
        
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


        var retryFn = function(url){
    
            log.error("failed 1 time: ",url);
            getXmlStream(url, (url)=>{
                log.error("failed 2 times: ",url);
            });
        };     
                                                        
        for (var url of ecms_urls) {
            getXmlStream(url, retryFn);
        }

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