exports.getAllWithAge = {
	map: function (doc) {
            //var tempsendung = {}; //speichere letzte sendung vor 5:30
            var out = {};
        	if (doc.station) {
                //finde sendung die 5:30 anfängt oder schneidet
                /*
                wenn hh:mm:ss < 05:30:00 ist
                dann    startzeit = jahr-monat-(tag-1) 05:30:00
                sonst   startzeit = jahr-monat-(tag)   05:30:00
                */
                var today     = new Date();
                var today_int = (today.getHours()) * 10000 + today.getMinutes() * 100 + today.getSeconds();

        		//2013-08-28T05:00:00+02:00
                var airtime    = new Date(doc.time);
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
        		emit([doc.station.name, diff], out);                
        	}
    	}
};



