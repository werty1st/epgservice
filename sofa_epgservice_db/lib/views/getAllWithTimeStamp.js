exports.getAllWithTimeStamp = {
	map: function (doc) {
            //var tempsendung = {}; //speichere letzte sendung vor 5:30
            var out = {};
        	if (doc.station) {
               
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
                out.item_created  = doc.item_created;
                out.item_modified = doc.item_modified;
                out.rev     = doc["_rev"];

                //if (diff >= -5)
        		emit(doc.time, out);                
        	}
    	}
};


