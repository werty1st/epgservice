const EventEmitter = require('events');
const request = require("request");

class Api {

    constructor(){
        
        this._token = 0;

        setTimeout( ()=>{
            this._token = Date.now();
        },1000 )
    }

    get token(){
        return Promise.resolve( this._token );
    }
}

class Cat extends EventEmitter {
    
    constructor() {
    
        super();
        this.on('wave', this.onWave);
        let api = new Api();

        this.apiRequest = request.defaults({
                headers: {
                    'User-Agent': process.env.npm_package_config_useragent,
                    'Api-Auth': `bearer ${api.token}`,
                    'Accept': "application/vnd.de.zdf.v1.0+json;charset=utf-8"
                }
            }); 

    }
    onWave() {
      console.log('prototype wave');
    }

    belle() {
        this.apiRequest.get("http://localhost:3300/",(err, res)=>{
            console.log("res",res.body)
        })
    }    
  }
  
  var cat = new Cat();
  cat.emit('wave');

  var cat1 = new Cat();
  cat1.belle();

  setTimeout(function() {
    cat1.belle();
  }, 2000);