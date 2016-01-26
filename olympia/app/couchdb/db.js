/* global bot */

var dbconf = require('../.config.json').couchdb;
var ecms = require('nano')(dbconf.url);


function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }   

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

function save( sendung, done ){
    ecms.insert(sendung, (err, docHead)=>{
        if(err){
            console.log("failed saving doc");
            bot.error("failed saving doc");
            done();
        }else{
            //console.log("updated",sendung.image64);
            //update attachment
            //console.log("updated",sendung);
            var image = decodeBase64Image(sendung.image64);
            //console.log(docHead);
            ecms.attachment.insert(docHead.id, "image", image.data, image.type, {rev: docHead.rev},(err)=>{
                if(err) console.log(err);
                done();
            });
        }
    });
}


function store( sendung, done ){
   
    //console.log("dbstore");

    //check if exists then update else save
    ecms.head(sendung._id, function(err, _, headers) {
    
        if (!err){
            //console.log(headers);
            // update
            //build hash from json to decide if update needed
            sendung._rev = headers.etag.replace(/['"]+/g, ''); //nervige doppelte "
            save( sendung, done );
        } else {
            // save
            if (err.statusCode == 404){
                //save new
                save( sendung, done );
            } else{
                console.log(err);
                done();                
            }
                     
        }
        
    });    
    


}
    
module.exports = {
    store: store
};