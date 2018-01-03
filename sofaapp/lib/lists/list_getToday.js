
exports.list_getToday = function (head, req) {
    
    var moment = require("lib/moment");
	var station = req.query.station || "all";
	var days    = parseInt(req.query.days || 0);

	var out = [];
	var outAll = {};

    var header = {};
    
    var airtimeSendung;
    var endzeitSendung;   
    
    var sendung = {};  


	//detect wrong station
	if (["olympia1","olympia2","olympia3","olympia4","olympia5","olympia6","zdf","all"].indexOf(station) === -1 )
	{
		header['Content-Type'] = 'application/json; charset=utf-8';
		start({code: 404, headers: header});
		send(["Document not found."]);
		return;
	}
 

    // jetzt plus X Tage
    var startTag = moment().add(days, 'days');      //6.8. 00:26
    var stopTag  = moment().add(days+1, 'days');    //7.8. 00:26

    // Sendungstag von StartTag
    var startSendungstag = startTag.clone().hour(5).minute(30).second(0).millisecond(0);        //6.8. 05:30
    // Sendungstag von StopTag
    var stopSendungstag = stopTag.clone().hour(5).minute(30).second(0).millisecond(0);          //7.8. 05:30

    // wir sind zwischen 00:00-05:30 und müssen für die erste sendung des tages einen tag zurück
    if( startTag.isBefore(startSendungstag) ) 
    {
        // gestern
        startSendungstag.subtract(1, 'days');
        stopSendungstag.subtract(1, 'days');
    } else                
    {   // heute
    }

/*    header['startTag'] = startTag.format();
    header['stopTag']  = stopTag.format();

    header['startSendungstag'] = startSendungstag.format();
    header['stopSendungstag']  = stopSendungstag.format();*/

    while( (row = getRow()) ){	

        //drop ard
        if ( row.value.station == "ard") continue;

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
        delete sendung._conflicts;			
        delete sendung._deleted_conflicts;			
        		

        //sendung überschneidet sendetag. sie muss VOR 5:30 starten und nach 5:30 enden
        //05.08 05:35	>  05.08 05:30 			 4:00       < 5:30
        if (( endzeitSendung.isAfter(startSendungstag) ) && ( airtimeSendung.isBefore(startSendungstag) )){
            
            if (station == "all"){
                outAll[stationname].push(sendung);                 
            } else if (stationname == station) {
                out.push(sendung);    
            }
        }

        //betrifft alle die 5:30 oder später starten aber nicht die die vor 5:30 starten und nach oder um 5:30 des folgetages enden
        if ( airtimeSendung.isSameOrAfter(startSendungstag) && ( endzeitSendung.isSameOrBefore(stopSendungstag) )){

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
    

	if (JSON.stringify(out).length === 2){
		header['Content-Type'] = 'application/json; charset=utf-8';
		start({code: 204, headers: header});
		send(["Empty response"]);
		return;		
	}

    header['Content-Type'] = 'application/json; charset=utf-8';
    start({code: 200, headers: header});
    //TODO Fehlermeldung wenn leer
    send(JSON.stringify(out));

};


