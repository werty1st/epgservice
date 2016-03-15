
exports.list_getToday = function (head, req) {
    
    var moment = require("lib/moment");
        
    function provides_json(out,header) {
        
        header['Content-Type'] = 'application/json; charset=utf-8';
        start({code: 200, headers: header});
        //TODO Fehlermeldung wenn leer
        send(JSON.stringify(out));
    }
    
	var format  = req.query.accept  || "";
	var station = req.query.station || "all";
	var days    = parseInt(req.query.days || 0);
	var version = req.query.version || "3";

	var wrapper = { "response" : { status : { "statuscode" : "ok"}, "sendungen" : [] }};
	var out = wrapper.response;

	//für alle sender station=""
	var wrapperAll = { "response" : { status : { "statuscode" : "ok"}, "sender" : {}  }};
	var outAll = wrapperAll.response;

    var header = {};

    // jetzt plus X Tage
    var startTag = moment().add(days, 'days');
    var stopTag  = moment().add(days+1, 'days');

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
       
        // selected station OR all
        var stationname = row.value.station;    
        if (!(stationname in outAll.sender)){
            outAll.sender[stationname] = {};
            outAll.sender[stationname].sendungen = [];	
        }
        
        var airtimeSendung = moment(row.value.start);
        var endzeitSendung = moment(row.value.end);

        delete row.value.rev;
        delete row.value.item_created;
        delete row.value.item_modified;			

            //5:35		> 5:30 			 4:00       < 5:30
        if (( endzeitSendung.isAfter(startTag) ) && ( airtimeSendung.isBefore(startTag) )){
            
            if (station == "all"){
                outAll.sender[stationname].sendungen.push({sendung:row});                 
            } else if (stationname == station) {
                out.sendungen.push({sendung:row});    
            }
        }

        //betrifft alle die 5:30 oder später starten aber nicht die die vor 5:30 starten und nach 5:30 enden
        if ( airtimeSendung.isSameOrAfter(startTag) && ( endzeitSendung.isBefore(stopSendungstag) )){

            if (station == "all"){
                outAll.sender[stationname].sendungen.push({sendung:row});                
            } else if (stationname == station) {
                out.sendungen.push({sendung:row});    
            }            
        }
    }
    
    
    if (station == "all"){
        wrapper = wrapperAll;
    }





	if (format == "json") {
		provides_json(wrapper, header);

	}else if (format == "xml") {
		provides_xml(wrapper, header);
	} else {
		provides_json(wrapper, header);
	}
};


