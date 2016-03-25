exports.getliveDocCount = function (head, req) {

	var format = req.query.accept || "";
	var debug  = (req.query.debug?true:false);
	var wrapper = { "response" : { status : { "statuscode" : "ok"} , "sendungen" : 0 }};
	var out = wrapper.response;
    var header = {};
    var code = 200;


	while(row = getRow()){	

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

			//5:35		> 5:30 			 4:00       < 5:30
		if ((endzeit_ms > startzeit_ms) && (airtime_ms < startzeit_ms)){
			out.sendungen += 1;
		}


		//betrifft alle die 5:30 oder später starten aber nicht die die vor 5:30 starten und nach 5:30 enden
		if (airtime_ms >= startzeit){
			out.sendungen += 1;
		}
	}

	if (debug) out.sendungen = 10;
	if (out.sendungen < 240 || out.sendungen > 300) {
		out.statuscode = "Fehler: Es sind zu wenig oder zuviel Programmdaten online.";
		//code = 503; 
	}

	if (format == "json") {
		provides_json(wrapper, header, code);

	}else if (format == "xml") {
		provides_xml(wrapper, header, code);
	} else {
		provides_json(wrapper, header, code);
	}
}



	function provides_json(out, header, code) {
		var code = code || 201;
		//TODO Fehlermeldung wenn leer
		start({code: code, headers: header});
		send(JSON.stringify(out));
	}

	function provides_xml (out, header, code) {
		var code = code || 200;
        header['Content-Type'] = 'application/xml; charset=utf-8';
        start({code: code, headers: header});
				
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
