var db = require('nano')(process.env.DB);
var bunyan = require('bunyan'), bformat = require('bunyan-format'), formatOut = bformat({ outputMode: 'short' });
var log = bunyan.createLogger({
    name: 'epgservice/olympia/couchdb/db',
    stream: formatOut,
    level: process.env.logLevel
    });


function save( sendung, done ){
    
    db.insert(sendung, (err, docHead)=>{
        
        if(sendung.externalId==="837c975b-a1bd-48b0-8059-9128d0187645"){
            log.debug("break");
        }
        
        if(err){
            log.error("failed saving doc");
            done(err);
        } else {
            done();
        }
    });    
}



function store( sendung, done ){
   
    //check if exists then update else save
    db.head(sendung._id, function(err, _, headers) {
        
        log.debug("save ",sendung.start,"-",sendung.titel);
        //openLogs[sendung.start,"-",sendung.titel].save=true;

        if (!err){
            // update
            //build hash from json to decide if update needed
            sendung._rev = headers.etag.replace(/['"]+/g, ''); //nervige doppelte "
            
            //update
            save( sendung, done );
        } else {
            if (err.statusCode == 404){
                //new
                save( sendung, done );
            } else{
                log.error("err.statusCode",err);
                done(err);
            }
        }
        
    });
}
    
module.exports = {
    store: store
};