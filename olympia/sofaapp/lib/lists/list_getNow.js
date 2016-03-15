exports.list_getNow = function (head, req) {

	function provides_json(out,header) {
        header['Content-Type'] = 'application/json; charset=utf-8';
		start({code: 200, headers: header});
		send(JSON.stringify(out));
	}

	var format = req.query.accept || "";
	var station = req.query.station || "all";
	var version = req.query.version || "3";

	var nowsendung = false;
	var wrapper = { "response" : { status : { "statuscode" : "ok"}, "sendungen" : [] }};
	var out = wrapper.response;

	//für alle sender station=""
	var wrapperAll = { "response" : { status : { "statuscode" : "ok"}, "sender" : {}  }};
	var outAll = wrapperAll.response;

    var header = {};


    //return;
    var i=0;
    
    var now;
    var startzeit;
    var endzeit;
    
    var z = {};    

    //alle stationen
    if (station == "all") {

	   	while( (row = getRow()) ) {
                         
	   		//wenn kein sendername vorhanden weiter zum nächsten
	   		if (!(row.value.station)) continue;
               
	   		station = row.value.station;

	   		//wenn der sender noch nicht exisitert lege neuen array unter sendername an
	   		if (!(station in outAll)){

				outAll[station] = [];	
	   		} 


	   		
	        // c1 = c1+1;
			now   	  = new Date();
			startzeit = new Date(row.value.start);
			endzeit   = new Date(row.value.end);
			
			//is sendung begin <=0 dann sendung = now
	        //suche aktuelle sendung wenn gefunden, gib sie aus und springe zu nächsten
			if ( (startzeit <= now) && (now <= endzeit) ){

                var x = {};
                x[row.id] = row.value;

				outAll[station].push( x );

				continue;
			}
	        //folgesendung gefunden, gib sie aus und beende

            z = {};
            z[row.id] = row.value;

			if (outAll[station].length == 1){
				outAll[station].push(z);
			}
		}
        wrapper = outAll;
    } else {
    //eine station   
	   	while( (row = getRow()) )  {
	   		if (row.value.station != station) continue;
	   		
	        // c1 = c1+1;
			now   	  = new Date();
			startzeit = new Date(row.value.start);
			endzeit   = new Date(row.value.end);
			
            z = {};
            z[row.id] = row.value;
			//is sendung begin <=0 dann sendung = now
	        //suche aktuelle sendung wenn gefunden, gib sie aus und springe zu nächsten
			if ( (startzeit <= now) && (now <= endzeit) ){
				nowsendung = true;
				out.sendungen.push(z);
				continue;
			}
	        //folgesendung gefunden, gib sie aus und beende
			if (nowsendung){
				out.sendungen.push(z);
				break;
			}
		}
        wrapper = out; 
	}

	header['X-API-Version'] = version;

	if (format == "json") {
		provides_json(wrapper, header);
	}else{
        provides_json(wrapper, header);
    }
};	


