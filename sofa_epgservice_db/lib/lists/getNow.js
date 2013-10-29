exports.getNow = function (head, req) {

	var format = req.query.accept || "";
	var station = req.query.station || "";
	var nowsendung = false;
	var wrapper = { "response" : { status : { "statuscode" : "ok"} , "sendungen" : [] }};
	var out = wrapper.response;

    var header = {};
    var c1 = 0;

   	while(row = getRow()) {
   		if (row.value.station.name != station) continue;
   		
        c1 = c1+1;
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

    //vergleiche 
    try {
        if (out.sendungen[0].sendung.value.endTime == out.sendungen[1].sendung.value.time)
        {
            header.debug1 = "endzeit==startzeit";
            log("no error");
        } else
        {
            header.debug1 = "das end und start datum weicht ab";        
            log("error");
        }        
    } catch( e) {
            header.debug1 = "das end und start datum ist nicht feststellbar";        
            header.debug1 = JSON.stringify(out);        
            header.debug1_c1 = 0;
            log("error");        
    }


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