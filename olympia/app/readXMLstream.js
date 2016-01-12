var XmlStream = require("xml-stream");
var Sender = require("./sender");

var sc=0;                                 
//xml stream reader
/**
 * @param {stream} stream from http get 
 * @param {date} date of url 
 * @param {function} callback to call after stream is closed 
 */
function readXML(stream, date, asyncDone){
    var xml = new XmlStream(stream, "utf8");

    var sender = new Sender(date);
    console.log(sender.uuid);
    
    //console.log(`Stream #${sc++} from: ${date.format("YYYY-MM-DD")}`);
    xml.on("data", function(data) {
        //process.stdout.write(data);
    });
    
    xml.collect('video');
    xml.on('endElement: video', function(video) {
        
        //drop channel <> 1-6
        if( video.channel > 0 && video.channel <7 ){
            console.log(video.title);    
        }        
    });    
    
    //suche nach video pder bracket
    
    
    xml.on("end", function(){
        asyncDone();
        xml = null;
    });
}

module.exports = readXML;