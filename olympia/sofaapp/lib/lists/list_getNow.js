exports.list_getNow = function (head, req) {

	var station = req.query.station || "all";

	var nowsendung = false;

	var out = [];
	var outAll = {};

    var header = {};

    var now;
    var startzeit;
    var endzeit;
    
	var sendung = {}; 


	while( (row = getRow()) ) {
						
		//wenn kein sendername vorhanden weiter zum nächsten
		if (!(row.value.station)) continue;
		
		if (( station != "all" ) && ( row.value.station != station)) continue;
			
		sendung = row.value;
		delete sendung._rev;
		delete sendung._id;
		delete sendung.version;	
				
		stationname = sendung.station;

		//wenn der sender noch nicht exisitert lege neuen array unter sendername an
		if (!(stationname in outAll)){
			outAll[stationname] = [];	
		} 

		now   	  = new Date();
		startzeit = new Date(sendung.start);
		endzeit   = new Date(sendung.end);
		
		//is sendung begin <=0 dann sendung = now
		//suche aktuelle sendung wenn gefunden, gib sie aus und springe zu nächsten
		if ( (startzeit <= now) && (now <= endzeit) ){

            if (station == "all"){
                outAll[stationname].push(sendung);                 
            } else if (stationname == station) {
                out.push(sendung);    
            }
			continue;
		}
		//folgesendung gefunden, gib sie aus und beende

		if (station == "all"){
			if (outAll[stationname].length == 1){
				outAll[stationname].push(sendung);
			}			                
		} else if (stationname == station) {
			if (out.length == 1){
				out.push(sendung);
			}   
		}
	} //end while
	
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
	send(JSON.stringify(out));
};	


