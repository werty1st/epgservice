//deprecated
exports.getRangeStartEndTime = {
	map: function (doc) {
            //var tempsendung = {}; //speichere letzte sendung vor 5:30
            var out = {};
        	if (doc.station ) {
               
        		//2013-08-28T05:00:00+02:00
                var airtime    = new Date(doc.time);
        		var airtime_ms = airtime.valueOf();

                out.station = { "name":doc.station.name};
                out.titel   = doc.titel;
                out.untertitel = doc.subtitle;
                out.time    = doc.time;
                out.endTime = doc.endTime;
                out.beschreibung = doc.beschreibung;
                out.url     = doc.url;
                out.rev     = doc["_rev"];

                //if (diff >= -5)
                emit(doc.station.name,    [doc.time,doc.endTime, doc["_rev"], doc.titel]);                
        		// emit([doc.station.name,doc.endTime], ["B", doc.titel]);                
                // emit([doc.station.name,doc.time],    ["A", doc.titel]);                
                // emit([doc.station.name,doc.endTime], ["B", doc.titel]);
        	}
    	}
};


/*
http://localhost:9999/epgservice/_design/epgservice/_view/getRangeStartEndTime?startkey=["ZDF","2013-10-22T12:00:00+02:00"]&endkey=["ZDF","2013-10-22T15:00:00+02:00"]
*/