exports.getNow = function (head, req) {

	var format = req.query.accept || "";
	var station = req.query.station || "all";
	var version = req.query.version || "1";

	var nowsendung = false;
	var wrapper = { "response" : { status : { "statuscode" : "ok"} , "sendungen" : [] }};
	var out = wrapper.response;

	//für alle sender station=""
	var wrapperAll = { "response" : { status : { "statuscode" : "ok"} , "sender" : {}  }};
	var outAll = wrapperAll.response;

    var header = {};
    // var c1 = 0;


    //alle stationen
    if (station == "all") {

	   	while(row = getRow()) {
	   		//wenn kein sendername vorhanden weiter zum nächsten
	   		if (!(row.value.station && row.value.station.name)) continue;

	   		var stationname = row.value.station.name;

			if ( (version == "2") && (row.value.station.name == "3sat") ) {
				stationname = "dreisat";
			}


	   		//wenn der sender noch nicht exisitert lege neuen array unter sendername an
	   		if (!(stationname in outAll.sender)){

				outAll.sender[stationname] = {};
				outAll.sender[stationname].sendungen = [];	
	   		} 


	   		
	        // c1 = c1+1;
			var now   	  = new Date();
			var startzeit = new Date(row.value.time);
			var endzeit   = new Date(row.value.endTime);
			
			//is sendung begin <=0 dann sendung = now
	        //suche aktuelle sendung wenn gefunden, gib sie aus und springe zu nächsten
			if ( (startzeit <= now) && (now <= endzeit) ){
				delete row.value.rev;
				delete row.value.item_created;
				delete row.value.item_modified;


				outAll.sender[stationname].sendungen.push({sendung:row});

				continue;
			}
	        //folgesendung gefunden, gib sie aus und beende


			if (outAll.sender[stationname].sendungen.length == 1){
				delete row.value.rev;
				delete row.value.item_created;
				delete row.value.item_modified;
				outAll.sender[stationname].sendungen.push({sendung:row});
			}

		}
		wrapper = wrapperAll;

    } else {
    //eine station   
	   	while(row = getRow()) {
	   		if (row.value.station.name != station) continue;
	   		
	        // c1 = c1+1;
			var now   	  = new Date();
			var startzeit = new Date(row.value.time);
			var endzeit   = new Date(row.value.endTime);
			
			//is sendung begin <=0 dann sendung = now
	        //suche aktuelle sendung wenn gefunden, gib sie aus und springe zu nächsten
			if ( (startzeit <= now) && (now <= endzeit) ){
				nowsendung = true;
				delete row.value.rev;
				delete row.value.item_created;
				delete row.value.item_modified;
				out.sendungen.push({sendung:row});
				continue;
			}
	        //folgesendung gefunden, gib sie aus und beende
			if (nowsendung){
				delete row.value.rev;
				delete row.value.item_created;
				delete row.value.item_modified;
				out.sendungen.push({sendung:row});
				break;
			}
		}
	}

	header['X-API-Version'] = version;

	if (format == "json") {
		provides_json(wrapper, header);
	}else if(format == "xml") {
		provides_xml(wrapper, header);
	} else{
        provides_json(wrapper, header);
    }
}	


	function provides_json(out,header) {
        header['Content-Type'] = 'application/json; charset=utf-8';
		start({code: 200, headers: header});
		send(JSON.stringify(out));
	}

	function provides_xml(out,header) {		
        header['Content-Type'] = 'application/xml; charset=utf-8';        
        start({code: 200, headers: header});
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