var flow = require("xml-flow");
var sc=0;   
                              
//xml stream reader
/**
 * @param {stream} stream from http get 
 * @param {function} callback to call after stream is closed 
 */
function readXML(stream, storeTagFn, doneXmlCb){
    var xml = flow(stream, "utf8");
     
    xml.on('tag:video', storeTagFn); 
    xml.on('tag:bracket', storeTagFn);  
     
    
    xml.on("end", () =>{
        doneXmlCb();        
        xml = null;
    });
}

module.exports = readXML;