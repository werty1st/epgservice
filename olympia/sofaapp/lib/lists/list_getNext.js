
exports.list_getNext = function (head, req) {
    
    var moment = require("moment");
        
    function provides_json(out,header) {
        
        header['Content-Type'] = 'application/json; charset=utf-8';
        start({code: 200, headers: header});
        //TODO Fehlermeldung wenn leer
        send(JSON.stringify(out));
    }
    
	var format  = req.query.accept  || "";
	var station = req.query.station || "all";
	var days    = req.query.days    || 0;
	var version = req.query.version || "3";

	var wrapper = { "response" : { status : { "statuscode" : "ok"}, "req.query": req.query, "sendungen" : [] }};
	var out = wrapper.response;

	//für alle sender station=""
	var wrapperAll = { "response" : { status : { "statuscode" : "ok"}, "req.query": req.query, "sender" : {}  }};
	var outAll = wrapperAll.response;

    var header = {};


    if (station == "all") {
		while(row = getRow()){	
			// var time_old = new Date(row.value.time);
			// var time_now = new Date();
			// var diff = parseFloat((Math.abs(time_now - time_old)/3600000).toPrecision(4));
			if (!(row.value.station)) continue;

	   		var stationname = row.value.station;

	   		if (!(stationname in outAll.sender)){
	   			outAll.sender[stationname] = {};
	   			outAll.sender[stationname].sendungen = [];	
	   		} 
			
            // sendetag + days
            // start: "2016-03-14T05:30:00+01:00",
            // now =  5:10 alter fernsehtag 
            // now =  5:45
            // now = 23:00 
            // now = 01:00             
            
			var today     = moment().add(days, 'days');
			var today_int = (today.hour()) * 10000 + today.minute() * 100 + today.second();

			//2013-08-28T05:00:00+02:00
			var airtime    = moment(row.value.start);
			var airtime_ms = airtime.format("X");

			var startzeit    = moment({ y: today.year(), M: today.month(), d: today.day(), h: 5, m: 30, s: 0, ms: 0 });
			var startzeit_ms = 0;

			var endzeit    = moment(row.value.end);
			var endzeit_ms = endzeit.format("X");

            
			if( today_int < 50300) //wir sind zwischen 00:00-05:30 und müssen für die erste sendung des tages einen tag zurück
			{
			    //gestern
			    //startzeit = new Date(startzeit.getTime() - 24*3600*1000);
			    startzeit = startzeit.subtract(1, "days"); 
			    startzeit_ms = startzeit.format("X");
			} else                
			{   //heute
			    startzeit_ms = startzeit.format("X");
			}
			
            req.query.x = {
                startzeit: startzeit,
                startzeit_ms: startzeit_ms,
                endzeit_ms: endzeit_ms,
                airtime_ms: airtime_ms,
                
            };
                        
			delete row.value.rev;
			delete row.value.item_created;
			delete row.value.item_modified;			

				//5:35		> 5:30 			 4:00       < 5:30
			if ((endzeit_ms > startzeit_ms) && (airtime_ms < startzeit_ms)){			
				outAll.sender[stationname].sendungen.push({sendung:row});
			}

			//betrifft alle die 5:30 oder später starten aber nicht die die vor 5:30 starten und nach 5:30 enden
			if (airtime_ms >= startzeit_ms){
				outAll.sender[stationname].sendungen.push({sendung:row});
			}
            
		} 
		wrapper = wrapperAll;
    } else {
		while(row = getRow()){	
			// var time_old = new Date(row.value.time);
			// var time_now = new Date();
			// var diff = parseFloat((Math.abs(time_now - time_old)/3600000).toPrecision(4));
			if (row.value.station != station) continue;

			var today     = new Date();
			var today_int = (today.getHours()) * 10000 + today.getMinutes() * 100 + today.getSeconds();

			//2013-08-28T05:00:00+02:00
			var airtime    = new Date(row.value.start);
			var airtime_ms = airtime.valueOf();

			var startzeit = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 5, 30, 0, 0);
			var startzeit_ms = 0;

			var endzeit = new Date(row.value.end);
			var endzeit_ms = endzeit.valueOf();

			if( today_int < 50300) //wir sind zwischen 00:00-05:30 und müssen für die erste sendung des tages einen tag zurück
			{
			    //gestern
			    //startzeit = new Date(startzeit.getTime() - 24*3600*1000);
			    startzeit.setDate(startzeit.getDate() - 1); 
			    startzeit_ms = startzeit.valueOf();
			} else                
			{   //heute
			    startzeit_ms = startzeit.valueOf();
			}

			delete row.value.rev;
			delete row.value.item_created;
			delete row.value.item_modified;			

				//5:35		> 5:30 			 4:00       < 5:30
			if ((endzeit_ms > startzeit_ms) && (airtime_ms < startzeit_ms)){
				out.sendungen.push({sendung:row});
			}


			//betrifft alle die 5:30 oder später starten aber nicht die die vor 5:30 starten und nach 5:30 enden
			if (airtime_ms >= startzeit){
				out.sendungen.push({sendung:row});
			}	
		}    	
    }





	if (format == "json") {
		provides_json(wrapper, header);

	}else if (format == "xml") {
		provides_xml(wrapper, header);
	} else {
		provides_json(wrapper, header);
	}
}


