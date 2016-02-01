exports.getNow = function (head, req) {

	function provides_json(out,header) {
        header['Content-Type'] = 'application/json; charset=utf-8';
		start({code: 200, headers: header});
		send(JSON.stringify(out));
	}

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
	   		if (!(row.value.channel)) continue;
               
	   		var stationname = row.value.channel;


	   		//wenn der sender noch nicht exisitert lege neuen array unter sendername an
	   		if (!(stationname in outAll.sender)){

				outAll.sender[stationname] = {};
				outAll.sender[stationname].sendungen = [];	
	   		} 


	   		
	        // c1 = c1+1;
			var now   	  = new Date();
			var startzeit = new Date(row.value.start);
			var endzeit   = new Date(row.value.end);
			
			//is sendung begin <=0 dann sendung = now
	        //suche aktuelle sendung wenn gefunden, gib sie aus und springe zu nächsten
			if ( (startzeit <= now) && (now <= endzeit) ){

				outAll.sender[stationname].sendungen.push({sendung:row});

				continue;
			}
	        //folgesendung gefunden, gib sie aus und beende


			if (outAll.sender[stationname].sendungen.length == 1){
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
			var startzeit = new Date(row.value.start);
			var endzeit   = new Date(row.value.end);
			
			//is sendung begin <=0 dann sendung = now
	        //suche aktuelle sendung wenn gefunden, gib sie aus und springe zu nächsten
			if ( (startzeit <= now) && (now <= endzeit) ){
				nowsendung = true;
				out.sendungen.push({sendung:row});
				continue;
			}
	        //folgesendung gefunden, gib sie aus und beende
			if (nowsendung){
				out.sendungen.push({sendung:row});
				break;
			}
		}
	}

	header['X-API-Version'] = version;

	if (format == "json") {
		provides_json(wrapper, header);
	}else{
        provides_json(wrapper, header);
    }
}	


