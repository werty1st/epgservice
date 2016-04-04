var moment = require("moment");
var https = require("https");
var flow  = require("xml-flow");



function SenderWeb(db){
    
    var opentag = 0;
    var delta = 0;
    var senderO = this;
    var finished;    
    var agent;



    /**
     * addSendetermin creates a new Sendung Object and assigns data from xml object
     * after that it collects the Sendungs Preview Image
     * the done callback is passed from main.js@readXMLstream and gets passed to 
     */
    function addSendetermin (xmlElement, done){
        
        opentag++;
               
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
        sendung.station          = "web" + xmlElement.channel;
        //sendung.externalImageUrl = `http://www.zdf.de/ZDFmediathek/contentblob/${sendung.vcmsid}/timg485x273blob`;
        sendung.externalImageUrl = `http://www.zdf.de/ZDFmediathek/contentblob/${sendung.vcmsid}/timg672x378blob`;


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
    function parseXmlStream(stream){

        /**
         * passElementFn is passed to the xml parser
         * it receives a xml video/bracket element and stores it to its corresponding 
         * channel (web[web1-6, p12[Hauptprogramm])
         * at this time it is possible to reduce 
         */
        function passElementFn( video ) {

            //get channel
            var channel = video.channel;

            //drop channel <> 1-6
            switch (channel) {
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                    addSendetermin(video, ()=>{ 
                        opentag--;
                        if (opentag===0){
                            if (finished) finished();
                        }
                    });
                    break;
                default:
            }
        }

        var xml = flow(stream, {strict:true});
         
        xml.on('tag:video', passElementFn); 
        xml.on('tag:bracket', passElementFn);  
    }
    
    //xml download
    /**
     * @param {string} url download xml  
     */
    function getXmlStream(url,retry){
        
        log.info("Download:",url);

        var get_options = require('url').parse(url);
        get_options.headers = {
                'User-Agent': agent,
                'Cache-Control': 'no-cache'
            };

        https.get(get_options, (responeStream) => {
                       

            if (responeStream.statusCode != 200){
                log.error(`Got invalid response: ${responeStream.statusCode} from ${url}`);
            } else {
                
                if (responeStream.headers['content-length'] == 0){
                    log.error(`Got emtpy response from ${url}`,responeStream.headers);
                    retry(url);
                    return;
                }else {                
                    //send to xml stream reader
                    parseXmlStream(responeStream);
                }   
            }

        }).on('error', (e) => {
            log.error(`Got error: ${e.message}`);
        });


    }



    /**
     * Genrate URLs based on DateTime.now() from Today-1 to Today+30 
     * 
     */
    this.update = function update(done){

        finished = done;
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


module.exports = SenderWeb;

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
