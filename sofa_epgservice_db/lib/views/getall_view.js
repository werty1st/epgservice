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