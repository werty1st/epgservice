/* global bot */

var db = require('nano')(process.env.DB);

function save( sendung, done ){
    
    db.insert(sendung, (err, docHead)=>{
        if(err){
            console.log("failed saving doc");
            bot.error("failed saving doc");
            done(err);
        } else {
            done();
        }
    });    
}



function store( sendung, done ){
   
    //check if exists then update else save
    db.head(sendung._id, function(err, _, headers) {
    

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
                console.log("err.statusCode",err);
                done(err);
            }
        }
    });
}
    
module.exports = {
    store: store
};