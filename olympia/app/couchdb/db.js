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

function save(sendung){
    ecms.insert(sendung, (err, docHead)=>{
        if(err){
            console.log("failed saving doc");
            bot.error("failed saving doc");
        }else{
            //console.log("updated");
            //update attachment
            var mime = sendung.image64.match(/data:([a-z]+\/[a-z]+);/i)[1];
            //console.log(docHead);
            ecms.attachment.insert(docHead.id, "image.png", decodeBase64Image(sendung.image64).data, mime, {rev: docHead.rev},(err)=>{
                if(err) console.log(err);
            });
        }
    });
}


function store( sendung ){
   

    //check if exists then update else save
    ecms.head(sendung._id, function(err, _, headers) {
    
        if (!err){
            //update
            //build hash from json to decide if update needed
            sendung._rev = headers.etag.replace(/['"]+/g, ''); //nervige doppelte "
            save( sendung );
        } else {
            //save
            save( sendung );            
        }
        
    });    
    


}
    
module.exports = {
    store: store
};