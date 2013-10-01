/*wird von php gebraucht*/
exports.getall_view = {
	map: function (doc) {
        	if (doc.station !== undefined) {
        		/*2013-08-28T05:00:00+02:00*/
                emit(doc.station.name,{"_id":doc._id,"_rev":doc._rev});        		
        	}
    	}
};