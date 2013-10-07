exports.getToday = function (head, req) {

	var format = req.query.accept || "";
	var firstsendung = {diff:-24}; //startwert, suche sendung mit dem kleinsten Minus 
	var first = true;			   // oder sendung start=0 dann brauche nwir keine vorherige sendung zu speichern und zu vergleichen
	var wrapper = { "response" : { status : { "statuscode" : "ok"} , "sendungen" : [] }};
	var out = wrapper.response;
    var header = {};

	while(row = getRow()){
		var diff = row.value.diff;

		//if (row.value.station.name.toLowerCase() != station) continue;			

		if (diff == 0) { first=false; } //wenn eine sendung um 5:30 anfängt brauchen wir keine vorherige sendung
	    if (diff < 0) {
	    	//verlgeichen und speichern order verwerfen
	        if(firstsendung.diff < diff) {
	            firstsendung.diff = diff;
	            firstsendung.row = row;
	        }
	    } else {
	    	//der ausgabe hinzufügen da größer oder gleich null
	    	delete row.value.diff;
	    	delete row.key;
	    	out.sendungen.push({sendung:row});
	    }			    
	}

	if (first) //wurde einen sendung kleiner 0 gefunden entferne das diff feld und füge sie am anfang des arrays ein
	{
		delete firstsendung.row.value.diff;
		delete firstsendung.row.key;
		out.sendungen.unshift({sendung:firstsendung.row});
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
		start({code: 200, headers: header});
		//TODO Fehlermeldung wenn leer
		send(JSON.stringify(out.sendungen));
	}

	function provides_xml (out,header) {

        header['Content-Type'] = 'application/xml; charset=utf-8';
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