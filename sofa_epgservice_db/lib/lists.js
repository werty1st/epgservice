/*
http://localhost:5984/epgservice/_design/epgservice/_list/getNowByStation_list/getNowByStation_view?descending=false&station=zdf
http://s.wrty.eu:5984/epgservice/_design/epgservice/_list/getNowByStation_list/getNowByStation_view?descending=false&station=zdf

*/
exports.getNowByStation_list = function (head, req) {
	

	provides("json", function() {
		var nowsendung = false;
		var out = {"sendungen" : [] };

		var station = req.query.station.toLowerCase() || "";

		if (station == "") {
			start({code: 510, headers: {'Content-Type': 'application/json; charset=utf-8'}});
			send({ "Error": "Station not set"});
			return
		};

		start({code: 200, headers: {'Content-Type': 'application/json; charset=utf-8'}});
		
		while(row = getRow()){
			if (row.value.station.name.toLowerCase() != station) continue; 

			var now   = new Date();
			var startzeit = new Date(row.value.time);
			var endzeit   = new Date(row.value.endTime);
			
			//is sendung begin <=0 dann sendung = now
			if (startzeit <= now && now <= endzeit ){
				nowsendung = true;
				out.sendungen.push({sendung:row});
				continue;
			}

			if (nowsendung){
				out.sendungen.push({sendung:row});
				break;
			}
		}	
		send(JSON.stringify(out));
	});

	provides("xml", function() {
		var nowsendung = false;
		var out = {"sendungen" : [] };

		var station = req.query.station.toLowerCase() || "";	

		if (station == "") {
			start({code: 510, headers: {'Content-Type': 'application/xml; charset=utf-8'}});
			send("<xml><Error>Document not found</Error></xml>");
			return
		};

		start({code: 200, headers: {'Content-Type': 'application/xml; charset=utf-8'}});
		
		while(row = getRow()){
			if (row.value.station.name.toLowerCase() != station) continue; 

			var now   = new Date();
			var startzeit = new Date(row.value.time);
			var endzeit   = new Date(row.value.endTime);
			
			//is sendung begin <=0 dann sendung = now
			if (startzeit <= now && now <= endzeit ){
				nowsendung = true;
				out.sendungen.push({sendung:row});
				continue;
			}

			if (nowsendung){
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
	});		

};

/*
http://localhost:5984/epgservice/_design/epgservice/_list/getAllByStation_list/getAllByStation_view?descending=false&station=zdf
*/
exports.getAllByStation_list = function (head, req) {

	provides("json", function() {
		var firstsendung = {diff:-24};
		var no_first = false;
		var out = { "sendungen" : [] };

		var station = req.query.station.toLowerCase() || "";


		if (station == "") {
			start({code: 510, headers: {'Content-Type': 'application/json; charset=utf-8'}});
			send({ "Error": "Station not set"});
			return
		};
		start({code: 200, headers: {'Content-Type': 'application/json; charset=utf-8'}});


		while(row = getRow()){
			var diff = row.value.diff;

			if (row.value.station.name.toLowerCase() != station) continue;			

			if (diff == 0) { no_first=true; } //wenn eine sendung um 5:30 anfängt brauchen wir keine vorherige sendung
		    if (diff < 0) {
		        if(firstsendung.diff < diff) {
		            firstsendung.diff = diff;
		            firstsendung.row = row;
		        }
		    } else {
		    	delete row.value.diff;
		    	out.sendungen.push({sendung:row});
		    }	
		    
		}
		if (firstsendung && !no_first)
		{
			delete firstsendung.row.value.diff;
			out.sendungen.unshift({sendung:firstsendung.row});
		}

		send(JSON.stringify(out.sendungen));
	});

	provides("xml", function() {
		var firstsendung = {diff:-24};
		var no_first = false;
		var out = { "sendungen" : [] };

		var station = req.query.station.toLowerCase() || "";


		if (station == "") {
			start({code: 510, headers: {'Content-Type': 'application/xml; charset=utf-8'}});
			send("<xml><Error>Station not set</Error></xml>");
			return
		};
		start({code: 200, headers: {'Content-Type': 'application/xml; charset=utf-8'}});

		
		while(row = getRow()){
			var diff = row.value.diff;

			if (row.value.station.name.toLowerCase() != station) continue;			

			if (diff == 0) { no_first=true; } //wenn eine sendung um 5:30 anfängt brauchen wir keine vorherige sendung
		    if (diff < 0) {
		        if(firstsendung.diff < diff) {
		            firstsendung.diff = diff;
		            firstsendung.row = row;
		        }
		    } else {
		    	delete row.value.diff;
		    	out.sendungen.push({sendung:row});
		    }	
		    
		}
		if (firstsendung && !no_first)
		{
			delete firstsendung.row.value.diff;
			out.sendungen.unshift({sendung:firstsendung.row});
		}		
		

		var filter = Object();
			filter["&"] = "&amp;";
		var myxml = require('lib/jstoxml');
		var xmlout = myxml.toXML(out,{header: true, indent: '  ',"filter":filter });
		send(xmlout);		
	});			
};


/*

http://s.wrty.eu:5984/epgservice/_design/epgservice/_list/getNowByStation_list/getNowByStation_view?descending=false&station=zdf

http://s.wrty.eu:5984/epgservice/_design/epgservice/_list/getNowByStation_list/getNowByStation_view?descending=false&station=zdfinfo

http://s.wrty.eu:5984/epgservice/_design/epgservice/_list/getNowByStation_list/getNowByStation_view?descending=false&station=zdfneo

http://s.wrty.eu:5984/epgservice/_design/epgservice/_list/getNowByStation_list/getNowByStation_view?descending=false&station=zdf.kultur




http://s.wrty.eu:5984/epgservice/_design/epgservice/_list/getAllByStation_list/getAllByStation_view?descending=false&station=zdf

http://s.wrty.eu:5984/epgservice/_design/epgservice/_list/getAllByStation_list/getAllByStation_view?descending=false&station=zdfinfo

http://s.wrty.eu:5984/epgservice/_design/epgservice/_list/getAllByStation_list/getAllByStation_view?descending=false&station=zdfneo

http://s.wrty.eu:5984/epgservice/_design/epgservice/_list/getAllByStation_list/getAllByStation_view?descending=false&station=zdf.kultur

*/