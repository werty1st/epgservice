exports.getNow = function (head, req) {

	var format = req.query.accept || "";

	if (format == "json") {
		provides_json(head, req);
	}else if (format == "xml") {
		provides_xml(head, req);
	} else {
		start({code: 510, headers: {'Content-Type': 'application/json; charset=utf-8'}});
		send("Accept parameter not defined");
	}
}
	

	function provides_json(head, req) {
		var nowsendung = false;
		var out = {"sendungen" : [] };

		// var station = req.query.station.toLowerCase() || "";
		// if (station == "") {
		// 	start({code: 510, headers: {'Content-Type': 'application/json; charset=utf-8'}});
		// 	send({ "Error": "Station not set"});
		// 	return
		// };

		start({code: 200, headers: {'Content-Type': 'application/json; charset=utf-8'}});
		
		while(row = getRow()){
			// if (row.value.station.name.toLowerCase() != station) continue; 

			var now   = new Date();
			var startzeit = new Date(row.value.time);
			var endzeit   = new Date(row.value.endTime);
			
			//is sendung begin <=0 dann sendung = now
			if (startzeit <= now && now <= endzeit ){
				nowsendung = true;
				delete row.key;
				delete row.value.diff;
				out.sendungen.push({sendung:row});
				continue;
			}

			if (nowsendung){
				delete row.key;
				delete row.value.diff;
				out.sendungen.push({sendung:row});
				break;
			}
		}	
		send(JSON.stringify(out));
	}

	function provides_xml(head, req) {
		var nowsendung = false;
		var out = {"sendungen" : [] };

		// var station = req.query.station.toLowerCase() || "";	
		// if (station == "") {
		// 	start({code: 510, headers: {'Content-Type': 'application/xml; charset=utf-8'}});
		// 	send("<xml><Error>Document not found</Error></xml>");
		// 	return
		// };

		start({code: 200, headers: {'Content-Type': 'application/xml; charset=utf-8'}});
		
		while(row = getRow()){
			// if (row.value.station.name.toLowerCase() != station) continue; 

			var now   = new Date();
			var startzeit = new Date(row.value.time);
			var endzeit   = new Date(row.value.endTime);
			
			//is sendung begin <=0 dann sendung = now
			if (startzeit <= now && now <= endzeit ){
				nowsendung = true;
				delete row.key;
				delete row.value.diff;
				out.sendungen.push({sendung:row});
				continue;
			}

			if (nowsendung){
				delete row.key;
				delete row.value.diff;
				out.sendungen.push({sendung:row});
				break;
			}
		}	

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