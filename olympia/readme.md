# ECMS/P12 EPG Aggregator

## Install

* clone repo (branch apiv2)
```bash
git clone -b apiv2 https://github.com/werty1st/epgservice.git
``` 

* run npm install
```bash
cd epgservice/olympia
npm install
```
 * rename .npmrc_default to .npmrc
 * add database to .npmrc
```bash
couchdb = http://user:pass@localhost:5984/ecms
```

 * adjust package.json -> config object
 * e.g. the delta flag changes the date of 2014 events to todays date.	
```javascript
"config": {
    "logLevel": "debug",
    "ecms": {
      "delta": true,
      "startdate": "2014-02-06",
      "enddate": "2014-02-23",
      "proto": "https",
      "host": "eventcms.zdf.de",
      "path": "/xml/olympia2014/epg/"
    },
    "p12": {
      "proto": "http",
      "range": 14 //days to download from today
    },
    "useragent": "request (nodejs) - Olympia/ECMS (HRNM - Webmaster/TTP)" //change the useragent to identify yourself
  }
```

 * install couchapp
```bash
npm run production:install
```
 
 * optional: customize [bunyan Logger](https://github.com/trentm/node-bunyan)
```bash
db.js
main.js
SenderWeb.js
SenderZDF.js
```
```javascript
var log = bunyan.createLogger({
    name: 'epgservice/olympia/couchdb/db',
    stream: formatOut,
    level: process.env.logLevel
    });
```


## Run

* register cronjob to execute:
```bash
npm run production:run
``` 


## Debug

* terminal 1:
```bash
npm run inspect
``` 

* terminal 2:
```bash
node-inspector
``` 
