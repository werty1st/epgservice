exports.lastmodified = function(doc, req) {

	return [null, JSON.stringify(req)];

	if (req.type == "lastmodified") {
    	if (!doc) {
    		return[{ id: req.id, timestamp: req.timestamp, type: req.type }, "Update successfull"];
       	} else {
       		if (doc.timestamp < req.timestamp) {
       			doc.timestamp = req.timestamp;
       			return [doc, "Update successfull"];
       		} else
       			return [null, 'your update req is too old'];

       	}


	} else
		return [null, 'your update req is not supported'];
}

