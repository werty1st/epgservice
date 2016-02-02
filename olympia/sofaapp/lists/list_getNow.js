exports.getNow = function (head, req) {

	function provides_json(out,header) {
        header['Content-Type'] = 'application/json; charset=utf-8';
		start({code: 200, headers: header});
		send(JSON.stringify(out));
	}

	var format = req.query.accept || "";
	var channel = req.query.channel || "all";
	var version = req.query.version || "3";

	var nowsendung = false;
    var wrapper;

	var out = [];
	var outAll = {};

    var header = {};

    header['X-Log'] = JSON.stringify(req.requested_path);
    header['X-Log-1'] = JSON.stringify(req.query);
    header['X-Log-3'] = channel;

    //return;
    var i=0;

    //alle stationen
    if (channel == "all") {

	   	while( (row = getRow()) ) {
                         
	   		//wenn kein sendername vorhanden weiter zum nächsten
	   		if (!(row.value.channel)) continue;
               
	   		channel = row.value.channel;

	   		//wenn der sender noch nicht exisitert lege neuen array unter sendername an
	   		if (!(channel in outAll)){

				outAll[channel] = [];	
	   		} 


	   		
	        // c1 = c1+1;
			var now   	  = new Date();
			var startzeit = new Date(row.value.start);
			var endzeit   = new Date(row.value.end);
			
			//is sendung begin <=0 dann sendung = now
	        //suche aktuelle sendung wenn gefunden, gib sie aus und springe zu nächsten
			if ( (startzeit <= now) && (now <= endzeit) ){

                var x = {};
                x[row.id] = row.value;

				outAll[channel].push( x );

				continue;
			}
	        //folgesendung gefunden, gib sie aus und beende

            var z = {};
            z[row.id] = row.value;

			if (outAll[channel].length == 1){
				outAll[channel].push(z);
			}
		}
        wrapper = outAll;
    } else {
    //eine station   
	   	while( (row = getRow()) )  {
	   		if (row.value.channel != channel) continue;
	   		
	        // c1 = c1+1;
			var now   	  = new Date();
			var startzeit = new Date(row.value.start);
			var endzeit   = new Date(row.value.end);
			
            var z = {};
            z[row.id] = row.value;
			//is sendung begin <=0 dann sendung = now
	        //suche aktuelle sendung wenn gefunden, gib sie aus und springe zu nächsten
			if ( (startzeit <= now) && (now <= endzeit) ){
				nowsendung = true;
				out.push(z);
				continue;
			}
	        //folgesendung gefunden, gib sie aus und beende
			if (nowsendung){
				out.push(z);
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
}	


