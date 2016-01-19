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
function readXML(stream, senderGruppe, date){
    var xml = flow(stream, "utf8");

         
    console.log(`Stream #${sc++} from: ${date.format("YYYY-MM-DD")}`);
        
    xml.on('tag:video', function(video) {

        //get channel
        var channel = video.$markup.find(item => item.$name == "channel").$markup[0];

        //drop channel <> 1-6
        switch (channel) {
            case "1":
                senderGruppe.web1.addVideo(video);
                break;
            case "2":
                senderGruppe.web2.addVideo(video);
                break;
            case "3":
                senderGruppe.web3.addVideo(video);
                break;
            case "4":
                senderGruppe.web4.addVideo(video);
                break;
            case "5":
                senderGruppe.web5.addVideo(video);
                break;
            case "6":
                senderGruppe.web6.addVideo(video);
                break;
            default:
                //console.log("Channel out of bounds", channel);  
                break;
        }
    }); 

    xml.on('tag:bracket', function(bracket) {
       
        //get channel
        var channel = bracket.$markup.find(item => item.$name == "channel").$markup[0];
        
        //drop channel <> 1-6
        switch (channel) {
            case "1":
                senderGruppe.web1.addBracket(bracket);
                break;
            case "2":
                senderGruppe.web2.addBracket(bracket);
                break;
            case "3":
                senderGruppe.web3.addBracket(bracket);
                break;
            case "4":
                senderGruppe.web4.addBracket(bracket);
                break;
            case "5":
                senderGruppe.web5.addBracket(bracket);
                break;
            case "6":
                senderGruppe.web6.addBracket(bracket);
                break;
            default:
                //console.log("Channel out of bounds", channel);  
                break;
        }        
    });  
     
    
    xml.on("end", () =>{        
        xml = null;
    });
}

module.exports = readXML;