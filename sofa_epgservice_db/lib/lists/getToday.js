exports.getToday = function (head, req) {

	var format = req.query.accept || "";
	var station = req.query.station || "all";
	var wrapper = { "response" : { status : { "statuscode" : "ok"} , "sendungen" : [] }};
	var out = wrapper.response;

	//für alle sender station=""
	var wrapperAll = { "response" : { status : { "statuscode" : "ok"} , "sender" : {}  }};
	var outAll = wrapperAll.response;

    var header = {};


    if (station == "all") {
		while(row = getRow()){	
			// var time_old = new Date(row.value.time);
			// var time_now = new Date();
			// var diff = parseFloat((Math.abs(time_now - time_old)/3600000).toPrecision(4));
			if (!(row.value.station && row.value.station.name)) continue;

	   		if (!(row.value.station.name in outAll.sender)){
	   			outAll.sender[row.value.station.name] = {};
	   			outAll.sender[row.value.station.name].sendungen = [];	
	   		} 
			

			var today     = new Date();
			var today_int = (today.getHours()) * 10000 + today.getMinutes() * 100 + today.getSeconds();

			//2013-08-28T05:00:00+02:00
			var airtime    = new Date(row.value.time);
			var airtime_ms = airtime.valueOf();

			var startzeit = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 5, 30, 0, 0);
			var startzeit_ms = 0;

			var endzeit = new Date(row.value.endTime);
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
				outAll.sender[row.value.station.name].sendungen.push({sendung:row});
			}

			//betrifft alle die 5:30 oder später starten aber nicht die die vor 5:30 starten und nach 5:30 enden
			if (airtime_ms >= startzeit){
				outAll.sender[row.value.station.name].sendungen.push({sendung:row});
			}	
		} 
		wrapper = wrapperAll;
    } else {
		while(row = getRow()){	
			// var time_old = new Date(row.value.time);
			// var time_now = new Date();
			// var diff = parseFloat((Math.abs(time_now - time_old)/3600000).toPrecision(4));
			if (row.value.station.name != station) continue;

			var today     = new Date();
			var today_int = (today.getHours()) * 10000 + today.getMinutes() * 100 + today.getSeconds();

			//2013-08-28T05:00:00+02:00
			var airtime    = new Date(row.value.time);
			var airtime_ms = airtime.valueOf();

			var startzeit = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 5, 30, 0, 0);
			var startzeit_ms = 0;

			var endzeit = new Date(row.value.endTime);
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

	function provides_json(out,header) {
		
        header['Content-Type'] = 'application/json; charset=utf-8';
        header['Cache-Control'] = 'no-transform,public,max-age=60,s-maxage=300';
        header['Vary'] = 'Accept-Encoding';


		start({code: 200, headers: header});
		//TODO Fehlermeldung wenn leer
		send(JSON.stringify(out));
	}

	function provides_xml (out,header) {

        header['Content-Type'] = 'application/xml; charset=utf-8';
        header['Cache-Control'] = 'no-transform,public,max-age=60,s-maxage=300';
        header['Vary'] = 'Accept-Encoding';        
        start({code: 200, headers: header});
				
		//TODO Fehlermeldung wenn leer
		var filter = Object();
			filter['"'] = "&quot;";
			filter["'"] = "&apos;";
			filter["<"] = "&lt;";
			filter[">"] = "&gt;";
			filter["&"] = "&amp;";
		var myxml = require('lib/jstoxml');
		var xmlout = myxml.toXML(out,{header: true, indent: '  ',"filter":filter });
		send(xmlout);		
	}	