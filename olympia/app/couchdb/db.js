var nano = require('nano')(process.env.DB);

db = nano.use(process.env.npm_package_config_database);


nano.session(function(err, session) {
  if (err) {    
    throw new Error("no database");
  }
  log.debug('DB user is %s and has these roles: %j',session.userCtx.name, session.userCtx.roles);
});




function save( sendung, done ){
    
    db.insert(sendung, (err, docHead)=>{
        
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