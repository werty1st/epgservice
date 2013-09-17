/*
//Limit by sender/station
//limit by id
//sort by date
//get json OR XML

//While Show functions are used to customize document presentation,
//List functions are used for same purpose, but against View functions results.
//
http://localhost:5984/epgservice/_design/epgservice/_view/getNowByStation_view?descending=false
*/

exports.getNowByStation_view = {
    map: function (doc) {
            var out = {};
            if (doc.station.name) { // == "ZDFinfo" ) { //
                //finde sendung die jetzt anfängt oder schneidet und die nächste
                /*
                wenn hh:mm:ss < 05:30:00 ist
                dann    startzeit = jahr-monat-(tag-1) 05:30:00
                sonst   startzeit = jahr-monat-(tag)   05:30:00
                */
                var now    = new Date();
                var now_ms = now.valueOf();

                //2013-08-28T05:00:00+02:00
                var airtime    = new Date(doc.time);
                var airtime_ms = airtime.valueOf();
                
                var diff = (airtime_ms-now_ms)/(3600*1000);
                // if (diff<0){
                //     if(tempsendung.diff < diff){
                //         tempsendung.diff = diff;
                //         tempsendung.doc = doc;
                //     }
                // }

                out.station = { "name":doc.station.name};
                out.titel   = doc.titel;
                out.time    = doc.time;
                out.endTime = doc.endTime;
                out.beschreibung = doc.beschreibung;
                out.url     = doc.url;

                //if (diff >= -5)
                emit(airtime_ms, out);
            }
        }
};

/*
http://localhost:5984/epgservice/_design/epgservice/_view/getAllByStation_view?descending=false
*/
exports.getAllByStation_view = {
	map: function (doc) {
            //var tempsendung = {}; //speichere letzte sendung vor 5:30
            var out = {};
        	if (doc.station) { //.name == "ZDFinfo"
                //finde sendung die 5:30 anfängt oder schneidet
                /*
                wenn hh:mm:ss < 05:30:00 ist
                dann    startzeit = jahr-monat-(tag-1) 05:30:00
                sonst   startzeit = jahr-monat-(tag)   05:30:00
                */
                var today     = new Date();
                var today_int = (today.getHours()) * 10000 + today.getMinutes() * 100 + today.getSeconds();

        		//2013-08-28T05:00:00+02:00
                var airtime     = new Date(doc.time);
        		var airtime_ms = airtime.valueOf();

                var startzeit = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 5, 30, 0, 0);
                var startzeit_ms = 0;

                if( today_int < 50300) //wir sind zwischen 00:00-05:30 und müssen für die erste sendung des tages einen tag zurück
                {
                    //gestern
                    startzeit = new Date(startzeit.getTime() - 24*3600*1000);
                    startzeit_ms = startzeit.valueOf();
                } else                
                {   //heute
                    startzeit_ms = startzeit.valueOf();
                }
        		
                var diff = (airtime_ms-startzeit_ms)/(3600*1000);
                // if (diff<0){
                //     if(tempsendung.diff < diff){
                //         tempsendung.diff = diff;
                //         tempsendung.doc = doc;
                //     }
                // }

                out.station = { "name":doc.station.name};
                out.titel   = doc.titel;
                out.time    = doc.time;
                out.endTime = doc.endTime;
                out.beschreibung = doc.beschreibung;
                out.url     = doc.url;
                out.diff    = diff;

                //if (diff >= -5)
        		emit(airtime_ms, out);
        	}
    	}
};








//wird von php gebraucht
exports.getold_view = {
	map: function (doc) {
        	if (doc.station !== undefined) {
        		//2013-08-28T05:00:00+02:00
        		var now = new Date();
        		var old = new Date(doc.programdata.airtimeBegin);

        		var diff = ((now - old)/3600000); //alter in stunden
        		
        		if (diff > 30)
        		 	emit(null,{"_id":doc._id,"_rev":doc._rev});

        	}
    	}
};

//wird von php gebraucht
exports.getall_view = {
	map: function (doc) {
        	if (doc.station !== undefined) {
        		//2013-08-28T05:00:00+02:00
                emit(doc.station.name,{"_id":doc._id,"_rev":doc._rev});        		
        	}
    	}
    // ,//http://localhost:5984/epgservice/_design/epgservice/_view/getall_view?key=%22ZDF%22&group=true
    // reduce: function (keys, values){ //, rereduce) {
    //     return sum(values);
    // }
};