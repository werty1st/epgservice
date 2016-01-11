//download URL and return string
var https = require("https");



function Downloader(options){

    this.get = function get(url,callback){
        
        console.log("Download:",url);
/*        var request = https.get({host:options.host,path:url}).on("response", function(response) {

            var xml = new XmlStream(response, "utf8");

            xml.on("data", function(data) {
                process.stdout.write(data);
            });

        });*/
        https.get({host:options.host,path:url}, (res) => {
            console.log(`Got response: ${res.statusCode}`);
            // consume response body
            res.resume();
        }).on('error', (e) => {
            console.log(`Got error: ${e.message}`);
        });        
    
    };
   
}

module.exports = function (o){
    return new Downloader(o);
    
};