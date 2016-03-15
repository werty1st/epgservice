var moment  = require("moment");
var async = require("async");
var http  = require("http");
var https  = require("https");
var flow  = require("xml-flow");
var xpathStream = require('xpath-stream');
var _ = require('underscore');
var bunyan = require('bunyan'), bformat = require('bunyan-format'), formatOut = bformat({ outputMode: 'short' });
var log = bunyan.createLogger({
    name: 'epgservice/olympia/sender/zdf',
    stream: formatOut,
    level: process.env.logLevel
    });

function SenderZDF(db){
    
    var opentag = 0;
    var senderO = this;
    var finished;
    var agent;
    var use_https;
    var request;

     /**
     * addVideo creates a new Sendung Object and assigns data from xml object
     * after that it collects the Sendungs Preview Image
     * the done callback is passed from main.js@readXMLstream and gets passed to 
     */
    function addSendetermin (xmlElement, done){
        
        opentag++;
        
        var sendung = {};
        var type_image;
        
        sendung.externalId      = xmlElement.$attrs.externalId;
        sendung._id             = xmlElement.$attrs.externalId;

        sendung.vcmsid          = "1822600";
        sendung.vcmsChannelId   = "74";
        sendung.copy            = xmlElement.text;
                
        sendung.titel           = xmlElement.titel || "";
        sendung.untertitel      = xmlElement.untertitel || "";
        sendung.dachzeile       = xmlElement.dachzeile || "";
        sendung.start           = xmlElement.beginnDatum;
        sendung.end             = xmlElement.endeDatum;
        sendung.station         = "zdf";
        

        // 672x378
        if ( xmlElement.bildfamilie && xmlElement.bildfamilie.ref ){
        /**
         * option1
         *   bildfamilie: 
         *      { ref: 'http://www.zdf.de/api/v2/content/p12:5989584',
         *       type: 'VisualFamily' }
         */            
            sendung.externalImageUrl = xmlElement.bildfamilie.ref;
            type_image = "xmlElement.bildfamilie.ref";
        } else if ( xmlElement.bildfamilie && xmlElement.bildfamilie.zuschnitte ){
        /** 
         * option2
         *  bildfamilie: 
         *      { visibleFrom: { 'xsi:nil': 'true' },
         *          visibleTo: { 'xsi:nil': 'true' },
         *          zuschnitte: 
         *          { '0': [Object],
         *          '1': [Object]  
         */      
            sendung.externalImageUrl = xmlElement.bildfamilie.zuschnitte;
            type_image = "xmlElement.bildfamilie.zuschnitte";
        } else if ("xmlElement.AutoVisualFamily") {
        /**
         *     3
         *  <bildfamilie>        
         *  <AutoVisualFamily>      
         */
            //sendung.externalImageUrl = xmlElement.bildfamilie.zuschnitte;
            type_image = "xmlElement.AutoVisualFamily";
        } else {
            sendung.externalImageUrl = "URLdummy";
            log.warn("URLdummy4");
        }
        
                        
 
        getImageUrl(type_image, sendung, ()=>{

            // store sendung to db
            db.store(sendung, (err)=>{
                if (err){
                    log.error("Error saving Sendung: ", err);
                }                
                // store to db complete
                log.debug(`id ${sendung._id} saved. id: ${opentag}`);
                done();
            });
            
        });          
    }


    /**
     * load image from sendung.url
     * callback is called after image is loaded
     */
    function getImageUrl(type, sendung, callback){
        var proto;
        
        if (use_https){
            proto = "https:";
        }else{
            proto = "http:";
        }
        
        switch (type) {
            case "xmlElement.bildfamilie.ref":                
                var get_options = require('url').parse(sendung.externalImageUrl);
                    get_options.headers = {'User-Agent': agent};

                //log.debug("1",sendung.externalImageUrl);
                request.get(get_options, (responeStream) => {

                    if (responeStream.statusCode != 200){
                        log.error(`Got invalid response: ${responeStream.statusCode} from ${url}`);
                    } else {
                        //send to xml stream reader                   
                        parseXmlStreamImage(responeStream, (imageurl)=>{
                            sendung.externalImageUrl = imageurl;
                            callback();
                        });
                    }
                }).on('error', (e) => {
                    console.error(`Error in response: from ${url}`);
                });                
                break;
            case "xmlElement.bildfamilie.zuschnitte":

                //object of image urls
                for (var objects in sendung.externalImageUrl) {
                    if (sendung.externalImageUrl[objects].image.indexOf("672x378") > -1){
                        sendung.externalImageUrl = proto + sendung.externalImageUrl[objects].image;
                        break;
                    }
                }
                callback();
                break;
            case "xmlElement.AutoVisualFamily":
                
                break;
        }
        
        
        
    }


    //xml stream parser to find image url
    /**
     * @param {stream} stream from http get.
     * passes sendungen to addSendetermin
     */
    function parseXmlStreamImage(stream, callback){

        ///VisualFamily/zuschnitte/Zuschnitt/breite

        stream
            .pipe(xpathStream("/VisualFamily/zuschnitte/Zuschnitt",{  
                breite: "breite/text()",
                hoehe:  "hoehe/text()",
                url: "image/Link/url/text()"
             }))
            .on('data',(imageList)=>{
                var url = imageList.filter((item)=>{
                   if ((item.breite == "672") && (item.hoehe == "378")){
                       return item.url;
                   } 
                });
                callback(url);
            });
    }


    //xml stream parser
    /**
     * @param {stream} stream from http get.
     * passes sendungen to addSendetermin
     */
    function parseXmlStream(stream){


        var xml = flow(stream, {strict:true});
        var last_page = true;

        // getNavigation
        stream
            .pipe(xpathStream("/EPG//navigation//Navigation//nextPageLink//Link//url//text()"))
            .on('data',(x)=>{
                last_page = false;
                var unescaped = _.unescape(x);
                getXmlStream(unescaped);
            });    


        // getSendungen
        xml.on('tag:Sendetermin', (xml)=>{
            addSendetermin(xml, ()=>{
                opentag--;
                if (opentag===0 && last_page){
                    if (finished) finished();
                }              
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
                'User-Agent': agent
            };

        request.get(get_options, (responeStream) => {

            if (responeStream.statusCode != 200){
                log.error(`Got invalid response: ${responeStream.statusCode} from ${url}`);
            } else {
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

        agent = process.env.npm_package_config_useragent;
        var range = process.env.npm_package_config_p12_range;

        if (process.env.npm_package_config_p12_proto === "https"){
            request = https;
        }else{
            request = http;
        }

        var startd = moment().subtract(1, 'days').format("YYYY-MM-DD");
        var stopd =  moment().add(range, 'days').format("YYYY-MM-DD");
      
        var url = `http://www.zdf.de/api/v2/epg?station=zdf&startDate=${startd}&endDate=${stopd}`;
        
        getXmlStream(url);

    };
        
}

module.exports = SenderZDF;








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