var request = require('request').defaults({ encoding: null });

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

    this.getImage = function getImage( sendung ){
        //http://dummyimage.com/485x273/000/fff&text=Emtpy
        //var url = `http://www.zdf.de/ZDFmediathek/contentblob/${sendung.vcmsid}/timg485x273blob`;
        var url = "http://dummyimage.com/485x273/000/fff&text=Emtpy";                
        request.get(url, (error, response, body) => {
            
            if (!error && response.statusCode == 200) {
                sendung.image64 = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
            }
            this.store();
        });        
    };


    
    this.store = function store (){
        db.store( JSON.parse(JSON.stringify(this)));
    };    
}

module.exports = Sendung;