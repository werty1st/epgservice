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
function readXML(stream, date, storeTagFn, doneXmlCb){
    var xml = flow(stream, "utf8");
         
    console.log(`Stream #${sc++} from: ${date.format("YYYY-MM-DD")}`);
        
      
     
    xml.on('tag:video', storeTagFn); 
    xml.on('tag:bracket', storeTagFn);  
     
    
    xml.on("end", () =>{
        doneXmlCb();        
        xml = null;
    });
}

module.exports = readXML;