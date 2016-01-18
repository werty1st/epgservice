//download URL and return string
var https = require("https");

/*global bot*/


/**
 * @param {object} options which have to include 
 * @return {string} The hex ID.
 */
function Downloader(options){

    /**
     * @param {object} options which have to include 
     * startdate, enddate, current (current date) and a path
     */
    this.get = function get(url,callback){
        
        return https.get(url, (res) => {
                //console.log(`Got response: ${res.statusCode}`);
                if (res.statusCode != 200){
                    bot.error(`URL ${url} Error response: ${res.statusCode}`);
                } else {
                    //send to xml stream reader
                    callback(res);   
                }
            }).on('error', (e) => {
                bot.error(`Got error: ${e.message}`);
            });        
    
    };
   
}


/**
 * @param {object} options which have to include 
 * @return {object} new Donwload Object.
 */
module.exports = function (o){
    return new Downloader(o);
    
};