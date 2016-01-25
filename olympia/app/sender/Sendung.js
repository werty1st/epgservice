var request = require('request').defaults({ encoding: null });



/**
 * Felder einer Sendung(db)
 * getImage() lädt Vorschaubild nach
 * store() speichert Sendung mit Bild in db
 */
function Sendung(db){
    
    this.ecmsid = 0;
    this.vcmsid = 0;
    this.vcmsChannelId = 0;
    this.typicalId = 0;
    this.title = ""; 
    this.copy = "";  
    this.start = 0; 
    this.end = 0;   
    this.channel = -1;     
    this.image64 = "";  
    this._id = 0; //doc id
    //this.sportart = "?";

    this.getImage = function getImage( sendung, done ){
        //http://dummyimage.com/485x273/000/fff&text=blank
        //var url = `http://www.zdf.de/ZDFmediathek/contentblob/${sendung.vcmsid}/timg485x273blob`;
        var url = "http://dummyimage.com/485x273/000/fff&text=Empty";                
        request.get(url, (error, response, body) => {
            
            if (!error && response.statusCode == 200) {
                sendung.image64 = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
            }
            // callback image load complete
            done();
        });        
    };
    
    this.store = function store ( done ){
        //console.log("store ok");
        db.store( JSON.parse(JSON.stringify(this)), done );
    };    
}

module.exports = Sendung;