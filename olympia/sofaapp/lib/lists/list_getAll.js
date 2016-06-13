module.exports = function (head, req) {
    
    var moment = require("lib/moment");
	var station = req.query.station || "all";


	var out = [];
	var outAll = {};

    var header = {};
    
    var airtimeSendung;
    var endzeitSendung;   
    
    var sendung = {};  

    // jetzt plus X Tage
    var startTag = moment();
    var stopTag  = moment().add(100, 'days');

    // wir sind zwischen 00:00-05:30 und müssen für die erste sendung des tages einen tag zurück
    if( startTag.isBefore(startSendungstag) ) 
    {
        // gestern
        startTag.subtract(1, 'days');
        stopTag.subtract(1, 'days');
    } else                
    {   // heute
    }

    // Sendungstag von StartTag
    var startSendungstag = startTag.hour(5).minute(30).second(0).millisecond(0);

    // Sendungstag von StopTag
    var stopSendungstag = stopTag.hour(5).minute(30).second(0).millisecond(0);

    while( (row = getRow()) ){	

        // filter station
        if (( station != "all" ) && ( row.value.station != station)) continue;
       
        sendung = row.value;
       
        // selected station OR all
        var stationname = sendung.station;    
        if (!(stationname in outAll)){
            outAll[stationname] = [];	
        }
        
        airtimeSendung = moment(sendung.start);
        endzeitSendung = moment(sendung.end);

      

        /**
         * remove unwanted properties */        
        delete sendung._rev;
        delete sendung._id;
        delete sendung.version;			
        		

            //5:35		> 5:30 			 4:00       < 5:30
        if (( endzeitSendung.isAfter(startTag) ) && ( airtimeSendung.isBefore(startTag) )){
            
            if (station == "all"){
                outAll[stationname].push(sendung);                 
            } else if (stationname == station) {
                out.push(sendung);    
            }
        }

        //betrifft alle die 5:30 oder später starten aber nicht die die vor 5:30 starten und nach 5:30 enden
        if ( airtimeSendung.isSameOrAfter(startTag) && ( endzeitSendung.isBefore(stopSendungstag) )){

            if (station == "all"){
                outAll[stationname].push(sendung);                
            } else if (stationname == station) {
                out.push(sendung);    
            }            
        }
    }
    
	// send outAll to client
	if (station == "all"){
		//remove empty arrays
		for (var key in outAll) {
			if (outAll.hasOwnProperty(key) && (outAll[key].length === 0) ) {
				delete outAll[key];
			}
		}
		out = outAll;
	}
    
    header['Content-Type'] = 'application/json; charset=utf-8';
    start({code: 200, headers: header});
    //TODO Fehlermeldung wenn leer
    send(JSON.stringify(out));

};


