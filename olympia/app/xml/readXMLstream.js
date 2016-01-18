var flow = require("xml-flow");



var vc=0;
var bc=0;

var sc=0;                                 
//xml stream reader
/**
 * @param {stream} stream from http get 
 * @param {date} date of url 
 * @param {function} callback to call after stream is closed 
 */
function readXML(stream, SenderGruppe, date, asyncDone){
    var xml = flow(stream, "utf8");
         
    console.log(`Stream #${sc++} from: ${date.format("YYYY-MM-DD")}`);

    
    function processElement( item ) {
        
   
               
    }
    
        
    xml.on('tag:video', function(video) {
        
        //12 videos
        // 4 brackets
        
        vc++;
        //drop channel <> 1-6
        switch (video.channel) {
            case "1":
                SenderGruppe.web1.addVideo();
                break;
            case "2":
                SenderGruppe.web2.addVideo();
                break;
            case "3":
                SenderGruppe.web3.addVideo();
                break;
            case "4":
                SenderGruppe.web4.addVideo();
                break;
            case "5":
                SenderGruppe.web5.addVideo();
                break;
            case "6":
                SenderGruppe.web6.addVideo();
                break;
            default:
                //console.log("Channel out of bounds", video.station);  
                break;
        }
        
    }); 

    xml.on('tag:bracket', function(bracket) {
        
        bc++; 
        //drop channel <> 1-6
        switch (bracket.channel) {
            case "1":
                SenderGruppe.web1.addBracket();
                break;
            case "2":
                SenderGruppe.web2.addBracket();
                break;
            case "3":
                SenderGruppe.web3.addBracket();
                break;
            case "4":
                SenderGruppe.web4.addBracket();
                break;
            case "5":
                SenderGruppe.web5.addBracket();
                break;
            case "6":
                SenderGruppe.web6.addBracket();
                break;
            default:
                //console.log("Channel out of bounds", video.station);  
                break;
        }      
    });  
     
    
    xml.on("end", function(){
        console.log("vc",vc,"bc",bc);
        asyncDone();
        xml = null;
    });
}

module.exports = readXML;